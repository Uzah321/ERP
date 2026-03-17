<?php

namespace App\Http\Controllers;

use App\Models\AssetRequest;
use App\Models\User;
use App\Models\Vendor;
use App\Mail\AssetRequestNotification;
use App\Mail\VendorQuotationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class AssetRequestController extends Controller
{
    public function index()
    {
        $requests = AssetRequest::with(['user', 'department', 'targetDepartment'])
            ->latest()
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'user_name' => $r->user?->name ?? 'Unknown',
                'department_name' => $r->department?->name ?? '-',
                'target_department_name' => $r->targetDepartment?->name ?? '-',
                'asset_category' => $r->asset_category,
                'requirements' => $r->requirements,
                'status' => $r->status,
                'created_at' => $r->created_at->format('Y-m-d'),
            ]);

        return Inertia::render('Admin/AssetRequests', [
            'requests' => $requests,
        ]);
    }

    public function update(Request $request, AssetRequest $assetRequest)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $assetRequest->update(['status' => $request->status]);

        return redirect()->back()->with('success', 'Request ' . $request->status . ' successfully.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'target_department_id' => 'required|exists:departments,id',
            'asset_category' => 'required|string|max:255',
            'requirements' => 'required|string'
        ]);

        $assetRequest = AssetRequest::create([
            'user_id' => Auth::id(),
            'department_id' => Auth::user()->department_id,
            'target_department_id' => $validated['target_department_id'],
            'asset_category' => $validated['asset_category'],
            'requirements' => $validated['requirements'],
            'status' => 'pending'
        ]);

        // Find internal users to notify
        $targetUsers = User::where('department_id', $validated['target_department_id'])->get();
        if ($targetUsers->isNotEmpty()) {
            Mail::to($targetUsers)->send(new AssetRequestNotification($assetRequest));
        }

        // Find matching vendors for this asset category
        $vendors = Vendor::where('product_category', $validated['asset_category'])->get();
        foreach ($vendors as $vendor) {
            Mail::to($vendor->contact_email)->send(new VendorQuotationRequest($assetRequest, $vendor));
        }

        return back()->with('success', 'Asset request submitted. Quotation requests have been sent to ' . $vendors->count() . ' vendor(s).');
    }
}

