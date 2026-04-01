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
            'locations' => Location::orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'barcode' => 'required|string',
            'location_id' => 'nullable|exists:locations,id',
        ]);

        $input = $request->barcode;

        // Look up by serial number first, then by barcode
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
}
