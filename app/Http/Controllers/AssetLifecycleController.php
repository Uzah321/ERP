<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Disposal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AssetLifecycleController extends Controller
{
    public function decommission(Asset $asset)
    {
        $asset->update(['status' => 'Decommissioned']);
        
        activity()
            ->performedOn($asset)
            ->causedBy(Auth::user())
            ->log('Asset Decommissioned (Pulled from Deployment)');

        return redirect()->back()->with('success', 'Asset formally Decommissioned.');
    }

    public function dispose(Request $request, Asset $asset)
    {
        $request->validate([
            'method' => 'required|string|in:Sold,Donated,Trashed,Recycled',
            'reason' => 'required|string',
            'recovery_amount' => 'nullable|numeric|min:0'
        ]);

        Disposal::create([
            'asset_id' => $asset->id,
            'user_id' => Auth::id(),
            'method' => $request->method,
            'reason' => $request->reason,
            'recovery_amount' => $request->recovery_amount
        ]);

        $asset->update(['status' => 'Disposed']);

        activity()
            ->performedOn($asset)
            ->causedBy(Auth::user())
            ->log("Asset Disposed off via {$request->method}.");

        return redirect()->back()->with('success', 'Asset officially Disposed.');
    }

    public function archive(Asset $asset)
    {
        // Leverage Laravel Soft Deletes for Archiving
        $asset->update(['status' => 'Archived']);
        $asset->delete();
        
        activity()
            ->performedOn($asset)
            ->causedBy(Auth::user())
            ->log('Asset Archived & hidden from active views.');

        return redirect()->back()->with('success', 'Asset Archived safely.');
    }
}
