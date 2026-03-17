<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\MaintenanceRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MaintenanceApiController extends Controller
{
    public function index(Asset $asset)
    {
        return response()->json(
            MaintenanceRecord::where('asset_id', $asset->id)->with('user')->latest()->get()
        );
    }

    public function store(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'issue_description' => 'required|string',
            'maintenance_type' => 'required|in:Preventive,Corrective,Emergency',
            'vendor_name' => 'nullable|string',
            'scheduled_date' => 'nullable|date',
        ]);

        $record = MaintenanceRecord::create([
            'asset_id' => $asset->id,
            'user_id' => Auth::id(),
            'maintenance_type' => $validated['maintenance_type'],
            'issue_description' => $validated['issue_description'],
            'vendor_name' => $validated['vendor_name'] ?? null,
            'scheduled_date' => $validated['scheduled_date'] ?? null,
            'status' => 'in-progress',
            'start_date' => now(),
        ]);

        $asset->update(['status' => 'Under Maintenance']);

        return response()->json($record, 201);
    }
}
