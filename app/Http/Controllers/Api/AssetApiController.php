<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AssetApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Asset::with(['department', 'category', 'location', 'assignee']);

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
        return response()->json(
            $asset->load(['department', 'category', 'location', 'assignee', 'maintenanceRecords'])
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'serial_number' => 'nullable|string|max:255|unique:assets,serial_number',
            'category_id' => 'required|exists:categories,id',
            'location_id' => 'required|exists:locations,id',
            'department_id' => 'nullable|exists:departments,id',
            'purchase_cost' => 'nullable|numeric',
            'purchase_date' => 'nullable|date',
            'condition' => 'required|string',
            'status' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $validated['barcode'] = 'SB-' . date('Y') . '-' . strtoupper(substr(uniqid(), -5));
        $validated['department_id'] = $validated['department_id'] ?? Auth::user()->department_id;

        $asset = Asset::create($validated);

        return response()->json($asset, 201);
    }

    public function update(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'serial_number' => 'nullable|string|max:255|unique:assets,serial_number,' . $asset->id,
            'category_id' => 'sometimes|required|exists:categories,id',
            'location_id' => 'sometimes|required|exists:locations,id',
            'purchase_cost' => 'nullable|numeric',
            'purchase_date' => 'nullable|date',
            'condition' => 'sometimes|required|string',
            'status' => 'sometimes|required|string',
            'description' => 'nullable|string',
        ]);

        $asset->update($validated);

        return response()->json($asset);
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();
        return response()->json(['message' => 'Asset archived successfully.']);
    }
}
