<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\MaintenanceRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MaintenanceController extends Controller
{
    public function store(Request $request, Asset $asset)
    {
        $request->validate([
            'issue_description' => 'required|string',
            'vendor_name' => 'nullable|string',
        ]);

        MaintenanceRecord::create([
            'asset_id' => $asset->id,
            'user_id' => Auth::id(),
            'issue_description' => $request->issue_description,
            'vendor_name' => $request->vendor_name,
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
