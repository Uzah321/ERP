<?php

namespace App\Http\Controllers;

use App\Models\Asset;
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
                ->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'barcode' => 'required|string'
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

        $asset->update([
            'last_audited_at' => now(),
            // Optionally flip condition to "Verified" or keep existing condition
        ]);

        activity()
            ->performedOn($asset)
            ->causedBy(Auth::user())
            ->log('Asset Audited & Verified Physically');

        return redirect()->back()->with('success', "Asset " . ($asset->serial_number ?: $asset->barcode) . " verified successfully!");
    }
}
