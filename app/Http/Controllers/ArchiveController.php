<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArchiveController extends Controller
{
    public function index()
    {
        $archivedAssets = Asset::onlyTrashed()
            ->with(['category', 'location'])
            ->latest('deleted_at')
            ->get();

        return Inertia::render('Lifecycle/ArchiveUtilities', [
            'archivedAssets' => $archivedAssets
        ]);
    }

    public function restore($id)
    {
        $asset = Asset::onlyTrashed()->findOrFail($id);
        $asset->status = 'Archived - Restored'; // reset status if needed
        $asset->save();
        $asset->restore();

        activity()
            ->performedOn($asset)
            ->causedBy(auth()->user())
            ->log('Asset Restored from Archive.');

        return redirect()->back()->with('success', 'Asset restored successfully.');
    }
}

