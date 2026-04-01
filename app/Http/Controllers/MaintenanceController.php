<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\MaintenanceRecord;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Carbon\Carbon;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    public function index()
    {
        $assets = Asset::withCount('maintenanceRecords')->get()->map(function($asset) {
            
            $startDate = $asset->purchase_date ? Carbon::parse($asset->purchase_date) : $asset->created_at;
            $timeInUse = $startDate->diffForHumans(null, true);

            return [
                'id' => $asset->id,
                'name' => $asset->name,
                'barcode' => $asset->barcode,
                'serial_number' => $asset->serial_number,
                'status' => $asset->status,
                'condition' => $asset->condition,
                'repair_count' => $asset->maintenance_records_count,
                'time_in_use' => $timeInUse,
                'store_id' => $asset->store_id,
            ];
        });

        $stores = Location::where('type', 'store')->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Maintenance/Index', [
            'assets' => $assets,
            'stores' => $stores
        ]);
    }

    public function show(Asset $asset)
    {
        $records = MaintenanceRecord::where('asset_id', $asset->id)
            ->with('user')
            ->latest()
            ->get();

        return Inertia::render('Maintenance/History', [
            'asset' => $asset->only('id', 'name', 'barcode', 'serial_number', 'status'),
            'records' => $records,
        ]);
    }

    public function store(Request $request, Asset $asset)
    {
        $request->validate([
            'issue_description' => 'required|string',
            'maintenance_type' => 'required|in:Preventive,Corrective,Emergency',
            'vendor_name' => 'nullable|string',
            'scheduled_date' => 'nullable|date',
        ]);

        MaintenanceRecord::create([
            'asset_id' => $asset->id,
            'user_id' => Auth::id(),
            'maintenance_type' => $request->maintenance_type,
            'issue_description' => $request->issue_description,
            'vendor_name' => $request->vendor_name,
            'scheduled_date' => $request->scheduled_date,
            'status' => 'in-progress',
            'start_date' => now(),
        ]);

        $asset->update(['status' => 'Under Maintenance']);

        activity()
            ->performedOn($asset)
            ->causedBy(Auth::user())
            ->log('Asset Flagged for Maintenance: ' . $request->issue_description);

        return redirect()->back()->with('success', 'Asset is now under maintenance.');
    }

    public function update(Request $request, Asset $asset)
    {
        $request->validate([
            'cost' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        $record = MaintenanceRecord::where('asset_id', $asset->id)
            ->where('status', 'in-progress')
            ->latest()
            ->firstOrFail();

        $record->update([
            'status' => 'completed',
            'end_date' => now(),
            'cost' => $request->cost,
            'notes' => $request->notes,
        ]);

        $asset->update(['status' => 'Active']);

        activity()
            ->performedOn($asset)
            ->causedBy(Auth::user())
            ->log('Maintenance Completed'. ($request->cost ? ' (Cost: $'.$request->cost.')' : ''));

        return redirect()->back()->with('success', 'Maintenance completed. Asset is active again.');
    }
}
