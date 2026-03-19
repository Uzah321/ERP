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
    // IT admin view: show all requests where target_department is IT and not from IT
    public function itRequests()
    {
        $itDepartment = \App\Models\Department::where('name', 'IT')->first();
        if (!$itDepartment) {
            abort(404, 'IT department not found');
        }
        $requests = \App\Models\AssetRequest::with(['user', 'department', 'targetDepartment'])
            ->where('target_department_id', $itDepartment->id)
            ->where('department_id', '!=', $itDepartment->id)
            ->latest()
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'user_name' => $r->user?->name ?? 'Unknown',
                'department_name' => $r->department?->name ?? '-',
                'target_department_name' => $r->targetDepartment?->name ?? '-',
                'asset_category' => $r->asset_category,
                'asset_type' => $r->asset_type,
                'for_whom' => $r->for_whom,
                'requirements' => $r->requirements,
                'status' => $r->status,
                'created_at' => $r->created_at->format('Y-m-d'),
            ]);
        return Inertia::render('Admin/ITAssetRequests', [
            'requests' => $requests,
        ]);
    }
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

        // Restrict approval to IT admins if the request is for IT department
        $itDepartment = \App\Models\Department::where('name', 'IT')->first();
        if ($itDepartment && $assetRequest->target_department_id === $itDepartment->id) {
            $user = Auth::user();
            if (!($user->department_id === $itDepartment->id && $user->role === 'admin' && $user->is_active)) {
                return redirect()->back()->with('error', 'Only IT admins can approve or reject IT asset requests.');
            }
        }

        $assetRequest->update(['status' => $request->status]);

        // Only send vendor emails if approved
        if ($request->status === 'approved') {
            $vendors = Vendor::where('product_category', $assetRequest->asset_category)->get();
            foreach ($vendors as $vendor) {
                $vendorModel = $vendor instanceof \App\Models\Vendor ? $vendor : \App\Models\Vendor::find($vendor->id);
                Mail::to($vendorModel->contact_email)->send(new VendorQuotationRequest($assetRequest, $vendorModel));
            }
        }

        return redirect()->back()->with('success', 'Request ' . $request->status . ' successfully.');
    }

    public function store(Request $request)
    {

        $validated = $request->validate([
            'target_department_id' => 'required|exists:departments,id',
            'asset_category' => 'required|string|max:255',
            'asset_type' => 'required|string|max:255',
            'for_whom' => 'required|string|max:255',
            'position' => 'required|string',
            'requirements' => 'required|string'
        ]);

        // Enforce IT asset specs by position (from dropdown)
        $isIT = \App\Models\Department::where('name', 'IT')->first()?->id == $validated['target_department_id'];
        $requirements = $validated['requirements'];
        $position = strtolower($validated['position']);
        if ($isIT && stripos($validated['asset_type'], 'laptop') !== false) {
            if (in_array($position, ['manager', 'hod'])) {
                // Managers/HODs must request 16GB+ RAM, 1TB+ storage, Core i7/Ultra 7+
                if (!preg_match('/(16GB|32GB|64GB)/i', $requirements)
                    || !preg_match('/(1TB|1TB|2TB|3TB|4TB|1024GB|2048GB|3072GB|4096GB)/i', $requirements)
                    || !preg_match('/(core i7|ultra 7)/i', $requirements)) {
                    return back()->with('error', 'Managers and HODs must request laptops with 16GB+ RAM, 1TB+ storage, and Core i7/Ultra 7 or above.');
                }
            } else {
                // Others must request Core i5 and 8GB RAM
                if (!preg_match('/(8GB)/i', $requirements) || !preg_match('/(core i5)/i', $requirements)) {
                    return back()->with('error', 'Non-managers must request laptops with Core i5 and 8GB RAM.');
                }
            }
        }

        $assetRequest = AssetRequest::create([
            'user_id' => Auth::id(),
            'department_id' => Auth::user()->department_id,
            'target_department_id' => $validated['target_department_id'],
            'asset_category' => $validated['asset_category'],
            'asset_type' => $validated['asset_type'],
            'for_whom' => $validated['for_whom'],
            'position' => $validated['position'],
            'requirements' => $requirements,
            'status' => 'pending'
        ]);


        // Always notify the super user
        $superUserEmail = 'd.zondo@simbisa.co.zw';
        Mail::to($superUserEmail)->send(new AssetRequestNotification($assetRequest));

        // Notify all IT admins if the request is for IT department
        $itDepartment = \App\Models\Department::where('name', 'IT')->first();
        if ($itDepartment && (int)$validated['target_department_id'] === $itDepartment->id) {
            $itAdmins = User::where('department_id', $itDepartment->id)
                ->where('role', 'admin')
                ->where('is_active', true)
                ->get();
            if ($itAdmins->isNotEmpty()) {
                Mail::to($itAdmins)->send(new AssetRequestNotification($assetRequest));
            }
        } else {
            // Fallback: notify all users in the target department (legacy behavior)
            $targetUsers = User::where('department_id', $validated['target_department_id'])->get();
            if ($targetUsers->isNotEmpty()) {
                Mail::to($targetUsers)->send(new AssetRequestNotification($assetRequest));
            }
        }

        // Find matching vendors for this asset category
        $vendors = Vendor::where('product_category', $validated['asset_category'])->get();
        foreach ($vendors as $vendor) {
            Mail::to($vendor->contact_email)->send(new VendorQuotationRequest($assetRequest, $vendor));
        }

        return back()->with('success', 'Asset request submitted. Quotation requests have been sent to ' . $vendors->count() . ' vendor(s).');
    }
}

