<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AssetApiController extends Controller
{
    public function index(Request $request)
    {
        $supportsLocationHierarchy = $this->supportsLocationHierarchy();

        $relations = ['department', 'category', 'location', 'assignee'];

        if ($supportsLocationHierarchy) {
            $relations[] = 'complex';
            $relations[] = 'store';
        }

        $query = Asset::with($relations);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        return response()->json($query->latest()->paginate(50));
    }

    public function show(Asset $asset)
    {
        $relations = ['department', 'category', 'location', 'assignee', 'maintenanceRecords'];

        if ($this->supportsLocationHierarchy()) {
            $relations[] = 'complex';
            $relations[] = 'store';
        }

        return response()->json(
            $asset->load($relations)
        );
    }

    public function store(Request $request)
    {
        $supportsLocationHierarchy = $this->supportsLocationHierarchy();

        $rules = [
            'name' => 'required|string|max:255',
            'serial_number' => 'nullable|string|max:255|unique:assets,serial_number',
            'category_id' => 'required|exists:categories,id',
            'department_id' => 'nullable|exists:departments,id',
            'purchase_cost' => 'nullable|numeric',
            'purchase_date' => 'nullable|date',
            'condition' => 'required|string',
            'status' => 'required|string',
            'description' => 'nullable|string',
        ];

        if ($supportsLocationHierarchy) {
            $rules['complex_id'] = ['required', Rule::exists('locations', 'id')->where(fn ($query) => $query->where('type', 'complex'))];
            $rules['store_id'] = ['nullable', Rule::exists('locations', 'id')->where(fn ($query) => $query->where('type', 'store'))];
        } else {
            $rules['complex_id'] = ['required', 'exists:locations,id'];
            $rules['store_id'] = ['nullable'];
        }

        $validated = $request->validate($rules);

        $locationSelection = $this->resolveLocationSelection($request, $supportsLocationHierarchy);

        $validated['barcode'] = 'SB-' . date('Y') . '-' . strtoupper(substr(uniqid(), -5));
        $validated['department_id'] = $validated['department_id'] ?? Auth::user()->department_id;
        $validated['location_id'] = $locationSelection['location_id'];

        if ($supportsLocationHierarchy) {
            $validated['complex_id'] = $locationSelection['complex_id'];
            $validated['store_id'] = $locationSelection['store_id'];
        }

        $asset = Asset::create($validated);

        return response()->json($asset, 201);
    }

    public function update(Request $request, Asset $asset)
    {
        $supportsLocationHierarchy = $this->supportsLocationHierarchy();

        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'serial_number' => 'nullable|string|max:255|unique:assets,serial_number,' . $asset->id,
            'category_id' => 'sometimes|required|exists:categories,id',
            'purchase_cost' => 'nullable|numeric',
            'purchase_date' => 'nullable|date',
            'condition' => 'sometimes|required|string',
            'status' => 'sometimes|required|string',
            'description' => 'nullable|string',
        ];

        if ($supportsLocationHierarchy) {
            $rules['complex_id'] = ['sometimes', 'required', Rule::exists('locations', 'id')->where(fn ($query) => $query->where('type', 'complex'))];
            $rules['store_id'] = ['nullable', Rule::exists('locations', 'id')->where(fn ($query) => $query->where('type', 'store'))];
        } else {
            $rules['complex_id'] = ['sometimes', 'required', 'exists:locations,id'];
            $rules['store_id'] = ['nullable'];
        }

        $validated = $request->validate($rules);

        if ($request->filled('complex_id')) {
            $locationSelection = $this->resolveLocationSelection($request, $supportsLocationHierarchy);
            $validated['location_id'] = $locationSelection['location_id'];

            if ($supportsLocationHierarchy) {
                $validated['complex_id'] = $locationSelection['complex_id'];
                $validated['store_id'] = $locationSelection['store_id'];
            }
        }

        $asset->update($validated);

        return response()->json($asset);
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();
        return response()->json(['message' => 'Asset archived successfully.']);
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

        $complex = Location::query()->hierarchyType('complex')->find($request->complex_id);

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
            ->hierarchyType('store')
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
}
