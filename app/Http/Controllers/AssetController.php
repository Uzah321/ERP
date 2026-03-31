<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Category;
use App\Models\Department;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AssetController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $user = Auth::user();
        $department = $user->department;
        $supportsLocationHierarchy = $this->supportsLocationHierarchy();

        // Fetch arrays for our dropdowns with short-circuit cache to speed rendering
        $categories = cache()->remember('categories-dropdown', now()->minutes(30), fn() => Category::select('id', 'name')->orderBy('name')->get());
        $complexes = cache()->remember('locations-dropdown', now()->minutes(30), function () use ($supportsLocationHierarchy) {
            if ($supportsLocationHierarchy) {
                return Location::complexes()
                    ->select('id', 'name', 'address')
                    ->with(['stores' => fn ($query) => $query->select('id', 'name', 'address', 'parent_id')->orderBy('name')])
                    ->orderBy('name')
                    ->get();
            }

            return Location::select('id', 'name', 'address')
                ->orderBy('name')
                ->get()
                ->map(function (Location $location) {
                    $location->setRelation('stores', collect());

                    return $location;
                });
        });
        $departments = cache()->remember('departments-dropdown', now()->minutes(30), fn() => Department::select('id', 'name')->orderBy('name')->get());

        $relations = ['category:id,name', 'location:id,name'];

        if ($supportsLocationHierarchy) {
            $relations[] = 'location:id,name,type,parent_id';
            $relations[] = 'complex:id,name,parent_id';
            $relations[] = 'store:id,name,parent_id';
        }

        $query = Asset::with($relations);

        // Determine which department to show
        $selectedDepartmentId = null;
        if ($user->canViewAllDepartments()) {
            if ($request->filled('department_id')) {
                $selectedDepartmentId = (int) $request->department_id;
                $query->where('department_id', $selectedDepartmentId);
            }
        } else {
            $selectedDepartmentId = $user->department_id;
        }

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                // Changing ilike to like to support SQLite
                $q->where('name', 'like', "%$search%")
                  ->orWhere('barcode', 'like', "%$search%")
                  ->orWhere('serial_number', 'like', "%$search%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }

        if ($supportsLocationHierarchy) {
            if ($request->filled('complex_id')) {
                $query->where('complex_id', (int) $request->complex_id);
            }

            if ($request->filled('store_id')) {
                $query->where('store_id', (int) $request->store_id);
            }
        }

        $assets = $query->latest()->paginate(25)->withQueryString();

        $vendorCategories = cache()->remember(
            'vendor_categories-dropdown',
            now()->minutes(30),
            fn() => \App\Models\Vendor::query()
                ->whereNotNull('product_category')
                ->where('product_category', '!=', '')
                ->distinct()
                ->pluck('product_category')
        );

        $requestCategories = $this->requestCategories($categories, $vendorCategories);

        return Inertia::render('Dashboard', [
            'assets' => $assets,
            'filters' => $request->only(['search', 'status', 'condition', 'department_id', 'complex_id', 'store_id']),
            'all_departments' => $departments,
            'department' => $department,
            'selected_department_id' => $selectedDepartmentId,
            'categories' => $categories,
            'complexes' => $complexes,
            'locations' => $complexes,
            'vendor_categories' => $vendorCategories,
            'request_categories' => $requestCategories,
            'supports_location_hierarchy' => $supportsLocationHierarchy,
        ]);
    }

    private function requestCategories(Collection $categories, Collection $vendorCategories): Collection
    {
        $defaultCategories = collect([
            'Laptops',
            'Desktops',
            'Vehicles',
            'Office Furniture',
            'POS Machines',
            'Networking Equipment',
        ]);

        return $categories
            ->pluck('name')
            ->merge($vendorCategories)
            ->merge($defaultCategories)
            ->map(static fn ($category) => is_string($category) ? trim($category) : $category)
            ->filter()
            ->unique()
            ->values();
    }

    public function store(Request $request)
    {
        $supportsLocationHierarchy = $this->supportsLocationHierarchy();

        $rules = [
            'name' => 'required|string|max:255',
            'serial_number' => 'nullable|string|max:255|unique:assets,serial_number',
            'category_id' => 'required|exists:categories,id',
            'purchase_cost' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'condition' => 'required|in:New,Good,Fair,Poor,Critical',
            'status' => 'required|in:Active,Purchased,Under Maintenance,Decommissioned,Disposed,Archived',
            'description' => 'nullable|string',
            'depreciation_method' => 'nullable|in:straight_line,reducing_balance',
            'annual_depreciation_rate' => 'nullable|numeric|min:0|max:100',
            'asset_life_years'    => 'nullable|integer|min:1|max:50',
            'salvage_value'       => 'nullable|numeric|min:0',
            'warranty_expiry_date'=> 'nullable|date',
            'warranty_provider'   => 'nullable|string|max:255',
            'warranty_notes'      => 'nullable|string|max:1000',
            'photo'               => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'redirect_to'         => 'nullable|string',
        ];

        if ($supportsLocationHierarchy) {
            $rules['complex_id'] = ['required', Rule::exists('locations', 'id')->where(fn ($query) => $query->where('type', 'complex'))];
            $rules['store_id'] = ['nullable', Rule::exists('locations', 'id')->where(fn ($query) => $query->where('type', 'store'))];
        } else {
            $rules['complex_id'] = ['required', 'exists:locations,id'];
            $rules['store_id'] = ['nullable'];
        }

        $request->validate($rules);

        $locationSelection = $this->resolveLocationSelection($request, $supportsLocationHierarchy);

        // Automatically Generate a Barcode: AL (AssetLinq) + Year + Random 5-digit number
        $barcode = 'AL-' . date('Y') . '-' . strtoupper(substr(uniqid(), -5));

        // Handle photo upload
        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('asset-photos', 'public');
        }

        $assetData = [
            'name' => $request->name,
            'serial_number' => $request->serial_number,
            'barcode' => $barcode, // Generated barcode
            'category_id' => $request->category_id,
            'location_id' => $locationSelection['location_id'],
            'purchase_cost' => $request->purchase_cost,
            'purchase_date' => $request->purchase_date,
            'condition' => $request->condition,
            'status' => $request->status,
            'description' => $request->description,
            'department_id' => Auth::user()->department_id,
            'depreciation_method' => $request->depreciation_method ?? 'straight_line',
            'annual_depreciation_rate' => $request->filled('annual_depreciation_rate') ? $request->annual_depreciation_rate : 25,
            'asset_life_years'    => $request->asset_life_years,
            'salvage_value'       => $request->salvage_value,
            'warranty_expiry_date'=> $request->warranty_expiry_date,
            'warranty_provider'   => $request->warranty_provider,
            'warranty_notes'      => $request->warranty_notes,
            'photo_path'          => $photoPath,
            // Initialise current_value to purchase_cost so the depreciation command has a baseline
            'current_value'       => $request->purchase_cost ?: null,
        ];

        if ($supportsLocationHierarchy) {
            $assetData['complex_id'] = $locationSelection['complex_id'];
            $assetData['store_id'] = $locationSelection['store_id'];
        }

        Asset::create($assetData);

        return $this->redirectAfterSave($request);
    }

    public function update(Request $request, Asset $asset)
    {
        $supportsLocationHierarchy = $this->supportsLocationHierarchy();

        $rules = [
            'name' => 'required|string|max:255',
            'serial_number' => 'nullable|string|max:255|unique:assets,serial_number,' . $asset->id,
            'category_id' => 'required|exists:categories,id',
            'purchase_cost' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'condition' => 'required|in:New,Good,Fair,Poor,Critical',
            'status' => 'required|in:Active,Purchased,Under Maintenance,Decommissioned,Disposed,Archived',
            'description' => 'nullable|string',
            'depreciation_method' => 'nullable|in:straight_line,reducing_balance',
            'annual_depreciation_rate' => 'nullable|numeric|min:0|max:100',
            'asset_life_years'    => 'nullable|integer|min:1|max:50',
            'salvage_value'       => 'nullable|numeric|min:0',
            'warranty_expiry_date'=> 'nullable|date',
            'warranty_provider'   => 'nullable|string|max:255',
            'warranty_notes'      => 'nullable|string|max:1000',
            'photo'               => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'redirect_to'         => 'nullable|string',
        ];

        if ($supportsLocationHierarchy) {
            $rules['complex_id'] = ['required', Rule::exists('locations', 'id')->where(fn ($query) => $query->where('type', 'complex'))];
            $rules['store_id'] = ['nullable', Rule::exists('locations', 'id')->where(fn ($query) => $query->where('type', 'store'))];
        } else {
            $rules['complex_id'] = ['required', 'exists:locations,id'];
            $rules['store_id'] = ['nullable'];
        }

        $request->validate($rules);

        $locationSelection = $this->resolveLocationSelection($request, $supportsLocationHierarchy);

        // Handle photo upload — replace old file if new one supplied
        $photoPath = $asset->photo_path;
        if ($request->hasFile('photo')) {
            if ($photoPath) {
                Storage::disk('public')->delete($photoPath);
            }
            $photoPath = $request->file('photo')->store('asset-photos', 'public');
        }

        $updateData = [
            'name' => $request->name,
            'serial_number' => $request->serial_number,
            'category_id' => $request->category_id,
            'location_id' => $locationSelection['location_id'],
            'purchase_cost' => $request->purchase_cost,
            'purchase_date' => $request->purchase_date,
            'condition' => $request->condition,
            'status' => $request->status,
            'description' => $request->description,
            'depreciation_method' => $request->depreciation_method ?? 'straight_line',
            'annual_depreciation_rate' => $request->filled('annual_depreciation_rate') ? $request->annual_depreciation_rate : 25,
            'asset_life_years'    => $request->asset_life_years,
            'salvage_value'       => $request->salvage_value,
            'warranty_expiry_date'=> $request->warranty_expiry_date,
            'warranty_provider'   => $request->warranty_provider,
            'warranty_notes'      => $request->warranty_notes,
            'photo_path'          => $photoPath,
        ];

        if ($supportsLocationHierarchy) {
            $updateData['complex_id'] = $locationSelection['complex_id'];
            $updateData['store_id'] = $locationSelection['store_id'];
        }

        // If purchase_cost changed and current_value was never set, initialise it
        if ($request->purchase_cost && !$asset->current_value) {
            $updateData['current_value'] = $request->purchase_cost;
        }

        $asset->update($updateData);

        return $this->redirectAfterSave($request);
    }

    public function qrLabel(Asset $asset)
    {
        // Generate QR code as base64 PNG using chillerlan/php-qrcode
        $qrOptions = new \chillerlan\QRCode\QROptions([
            'outputType' => \chillerlan\QRCode\Output\QROutputInterface::GDIMAGE_PNG,
            'eccLevel'   => \chillerlan\QRCode\QRCode::ECC_H,
            'scale'      => 6,
            'imageBase64'=> false,
        ]);
        $qrCode = new \chillerlan\QRCode\QRCode($qrOptions);
        $qrData = $asset->barcode ?? ('ASSET-' . $asset->id);
        $qrImage = $qrCode->render($qrData);
        $qrBase64 = base64_encode($qrImage);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.qr-label', [
            'asset'     => $asset,
            'qrBase64'  => $qrBase64,
        ])->setPaper([0, 0, 226.77, 283.46], 'portrait'); // ~80mm x 100mm

        return $pdf->download('label-' . ($asset->barcode ?? $asset->id) . '.pdf');
    }

    private function resolveLocationSelection(Request $request, bool $supportsLocationHierarchy): array
    {
        if (!$supportsLocationHierarchy) {
            $location = Location::find($request->complex_id);

            if (!$location) {
                throw ValidationException::withMessages([
                    'complex_id' => 'Select a valid location.',
                ]);
            }

            return [
                'location_id' => $location->id,
                'complex_id' => null,
                'store_id' => null,
            ];
        }

        $complex = Location::complexes()->find($request->complex_id);

        if (!$complex) {
            throw ValidationException::withMessages([
                'complex_id' => 'Select a valid complex.',
            ]);
        }

        if (!$request->filled('store_id')) {
            return [
                'location_id' => $complex->id,
                'complex_id' => $complex->id,
                'store_id' => null,
            ];
        }

        $store = Location::query()
            ->where('type', 'store')
            ->where('parent_id', $complex->id)
            ->find($request->store_id);

        if (!$store) {
            throw ValidationException::withMessages([
                'store_id' => 'The selected store does not belong to the chosen complex.',
            ]);
        }

        return [
            'location_id' => $store->id,
            'complex_id' => $complex->id,
            'store_id' => $store->id,
        ];
    }

    private function supportsLocationHierarchy(): bool
    {
        return Schema::hasColumns('locations', ['type', 'parent_id'])
            && Schema::hasColumns('assets', ['complex_id', 'store_id']);
    }

    private function redirectAfterSave(Request $request)
    {
        $redirectTo = $request->string('redirect_to')->toString();

        if ($redirectTo !== '' && str_starts_with($redirectTo, '/')) {
            return redirect($redirectTo);
        }

        return redirect()->route('asset-management.index');
    }
}


