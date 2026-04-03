<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuditController extends Controller
{
    public function index()
    {
        return Inertia::render('Audit', [
            'recent_audits' => Asset::whereDate('last_audited_at', today())
                ->with(['category', 'location'])
                ->latest('last_audited_at')
                ->get(),
            'locations' => Location::orderBy('name')->get(),
            'complexes' => Location::complexes()
                ->with(['stores' => fn($q) => $q->orderBy('name')])
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'barcode' => 'required|string',
            'location_id' => 'nullable|exists:locations,id',
        ]);

        $input = $request->barcode;

        $asset = Asset::where('serial_number', $input)->first()
              ?? Asset::where('barcode', $input)->first();

        if (!$asset) {
            return redirect()->back()->withErrors(['barcode' => 'No asset found matching this barcode or serial number.']);
        }

        if ($asset->status == 'Disposed' || $asset->trashed()) {
            return redirect()->back()->withErrors(['barcode' => 'Cannot audit a disposed or archived asset.']);
        }

        $updateData = ['last_audited_at' => now()];
        if ($request->location_id) {
            $updateData['location_id'] = $request->location_id;
        }

        $asset->update($updateData);

        activity()
            ->performedOn($asset)
            ->causedBy(Auth::user())
            ->log('Asset Audited & Verified Physically');

        return redirect()->back()->with('success', "Asset " . ($asset->serial_number ?: $asset->barcode) . " verified successfully!");
    }

    public function assetsByStore(Location $store)
    {
        $assets = Asset::where('store_id', $store->id)
            ->with(['category', 'location'])
            ->whereNotIn('status', ['Disposed'])
            ->orderBy('name')
            ->get(['id', 'name', 'serial_number', 'barcode', 'status', 'last_audited_at', 'category_id', 'location_id']);

        return response()->json($assets->load('category'));
    }

    public function bulkStore(Request $request)
    {
        $request->validate([
            'asset_ids' => 'required|array|min:1',
            'asset_ids.*' => 'integer|exists:assets,id',
        ]);

        $assets = Asset::whereIn('id', $request->asset_ids)
            ->whereNotIn('status', ['Disposed'])
            ->whereNull('deleted_at')
            ->get();

        $count = 0;
        foreach ($assets as $asset) {
            $asset->update(['last_audited_at' => now()]);
            activity()
                ->performedOn($asset)
                ->causedBy(Auth::user())
                ->log('Asset Audited & Verified Physically');
            $count++;
        }

        return redirect()->back()->with('success', "{$count} asset(s) verified successfully!");
    }
}
