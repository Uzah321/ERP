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

class AssetController extends Controller
{
        public function index(\Illuminate\Http\Request $request)
    {
        $user = Auth::user();
        $department = $user->department;

        // Fetch arrays for our dropdowns with short-circuit cache to speed rendering
        $categories = cache()->remember('categories-dropdown', now()->minutes(30), fn() => Category::select('id', 'name')->orderBy('name')->get());
        $locations = cache()->remember('locations-dropdown', now()->minutes(30), fn() => Location::select('id', 'name')->orderBy('name')->get());
        $departments = cache()->remember('departments-dropdown', now()->minutes(30), fn() => Department::select('id', 'name')->orderBy('name')->get());

        $query = Asset::with(['category:id,name', 'location:id,name']);

        // Determine which department to show
        $selectedDepartmentId = null;
        if ($user->role === 'admin') {
            // Admin must select a department to view its assets
            if ($request->filled('department_id')) {
                $selectedDepartmentId = (int) $request->department_id;
                $query->where('department_id', $selectedDepartmentId);
            }
            // If no department selected, admin sees no assets (must pick one)
        } else {
            // Non-admin: locked to their own department via global scope
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

        $assets = $query->latest()->paginate(25)->withQueryString();

        $vendorCategories = cache()->remember('vendor_categories-dropdown', now()->minutes(30), fn() => \App\Models\Vendor::select('product_category')->distinct()->pluck('product_category'));

        return Inertia::render('Dashboard', [
            'assets' => $assets,
            'filters' => $request->only(['search', 'status', 'condition', 'department_id']),
            'all_departments' => $departments,
            'department' => $department,
            'selected_department_id' => $selectedDepartmentId,
            'categories' => $categories,
            'locations' => $locations,
            'vendor_categories' => $vendorCategories
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'serial_number' => 'nullable|string|max:255|unique:assets,serial_number',
            'category_id' => 'required|exists:categories,id',
            'location_id' => 'required|exists:locations,id',
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
        ]);

        // Automatically Generate a Barcode: AL (AssetLinq) + Year + Random 5-digit number
        $barcode = 'AL-' . date('Y') . '-' . strtoupper(substr(uniqid(), -5));

        // Handle photo upload
        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('asset-photos', 'public');
        }

        Asset::create([
            'name' => $request->name,
            'serial_number' => $request->serial_number,
            'barcode' => $barcode, // Generated barcode
            'category_id' => $request->category_id,
            'location_id' => $request->location_id,
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
        ]);

        return redirect()->route('dashboard');
    }

    public function update(Request $request, Asset $asset)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'serial_number' => 'nullable|string|max:255|unique:assets,serial_number,' . $asset->id,
            'category_id' => 'required|exists:categories,id',
            'location_id' => 'required|exists:locations,id',
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
        ]);

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
            'location_id' => $request->location_id,
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

        // If purchase_cost changed and current_value was never set, initialise it
        if ($request->purchase_cost && !$asset->current_value) {
            $updateData['current_value'] = $request->purchase_cost;
        }

        $asset->update($updateData);

        return redirect()->route('dashboard');
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
}


