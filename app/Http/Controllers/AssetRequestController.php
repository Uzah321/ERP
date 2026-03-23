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
    // Approve via email link
    public function approveViaEmail(AssetRequest $assetRequest)
    {
        if ($assetRequest->status !== 'pending') {
            return redirect()->route('dashboard')->with('error', 'Request already processed.');
        }
        $assetRequest->update(['status' => 'approved']);
        // Notify requester
        Mail::to($assetRequest->user->email)->send(new AssetRequestNotification($assetRequest));
        // Send to vendors (reuse existing logic)
        $vendors = Vendor::where('product_category', $assetRequest->asset_category)->get();
        foreach ($vendors as $vendor) {
            if (!($vendor instanceof Vendor)) {
                $vendor = Vendor::find($vendor->id);
            }
            if ($vendor) {
                Mail::to($vendor->contact_email)->send(new VendorQuotationRequest($assetRequest, $vendor));
            }
        }
        return redirect()->route('dashboard')->with('success', 'Request approved and vendors notified.');
    }

    // Decline via email link
    public function declineViaEmail(AssetRequest $assetRequest)
    {
        if ($assetRequest->status !== 'pending') {
            return redirect()->route('dashboard')->with('error', 'Request already processed.');
        }
        $assetRequest->update(['status' => 'rejected']);
        // Notify requester
        Mail::to($assetRequest->user->email)->send(new AssetRequestNotification($assetRequest));
        return redirect()->route('dashboard')->with('success', 'Request declined and requester notified.');
    }

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
                'asset_type' => $r->asset_type ?? '-',
                'for_whom' => $r->for_whom ?? '-',
                'position' => $r->position ?? '-',
                'requirements' => $r->requirements,
                'status' => $r->status,
                'created_at' => $r->created_at->format('Y-m-d'),
            ]);

        return Inertia::render('Admin/AssetRequests', [
            'requests' => $requests,
        ]);
    }

    public function exportCsv()
    {
        $requests = AssetRequest::with(['user', 'department', 'targetDepartment'])
            ->latest()
            ->get();

        $filename = 'Asset_Requests_' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($requests) {
            $file = fopen('php://output', 'w');
            fputcsv($file, [
                'ID', 'Requested By', 'From Department', 'Target Department',
                'Asset Category', 'Asset Type', 'For Whom', 'Position',
                'Requirements', 'Status', 'Date',
            ]);
            foreach ($requests as $r) {
                fputcsv($file, [
                    $r->id,
                    $r->user?->name ?? 'Unknown',
                    $r->department?->name ?? '-',
                    $r->targetDepartment?->name ?? '-',
                    $r->asset_category,
                    $r->asset_type ?? '-',
                    $r->for_whom ?? '-',
                    $r->position ?? '-',
                    $r->requirements,
                    $r->status,
                    $r->created_at?->format('Y-m-d') ?? '-',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
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
                if (!($vendor instanceof Vendor)) {
                    $vendor = Vendor::find($vendor->id);
                }
                if ($vendor) {
                    Mail::to($vendor->contact_email)->send(new VendorQuotationRequest($assetRequest, $vendor));
                }
            }
        }

        return redirect()->back()->with('success', 'Request ' . $request->status . ' successfully.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'target_department_id' => 'required|exists:departments,id',
            'asset_category'       => 'required|string|max:255',
            'items'                => 'required|array|min:1',
            'items.*.asset_type'   => 'required|string|max:255',
            'items.*.for_whom'     => 'required|string|max:255',
            'items.*.position'     => 'required|string|max:255',
            'items.*.requirements' => 'required|string',
            'items.*.quantity'     => 'required|integer|min:1',
        ]);

        // Per-item IT spec validation
        $isIT = \App\Models\Department::where('name', 'IT')->first()?->id == $validated['target_department_id'];
        if ($isIT) {
            foreach ($validated['items'] as $i => $item) {
                $position = strtolower($item['position']);
                $requirements = $item['requirements'];
                if (stripos($item['asset_type'], 'laptop') !== false) {
                    if (in_array($position, ['manager', 'hod'])) {
                        if (!preg_match('/(16GB|32GB|64GB)/i', $requirements)
                            || !preg_match('/(1TB|2TB|3TB|4TB|1024GB|2048GB|3072GB|4096GB)/i', $requirements)
                            || !preg_match('/(core i7|ultra 7)/i', $requirements)) {
                            return back()->withErrors([
                                "items.{$i}.requirements" => 'Managers and HODs must request laptops with 16GB+ RAM, 1TB+ storage, and Core i7/Ultra 7 or above.',
                            ]);
                        }
                    } else {
                        if (!preg_match('/(8GB)/i', $requirements) || !preg_match('/(core i5)/i', $requirements)) {
                            return back()->withErrors([
                                "items.{$i}.requirements" => 'Non-managers must request laptops with Core i5 and 8GB RAM.',
                            ]);
                        }
                    }
                }
            }
        }

        // Use first item's fields for top-level columns (backward compatibility)
        $firstItem = $validated['items'][0];

        $assetRequest = AssetRequest::create([
            'user_id'              => Auth::id(),
            'department_id'        => Auth::user()->department_id,
            'target_department_id' => $validated['target_department_id'],
            'asset_category'       => $validated['asset_category'],
            'asset_type'           => $firstItem['asset_type'],
            'for_whom'             => $firstItem['for_whom'],
            'position'             => $firstItem['position'],
            'requirements'         => $firstItem['requirements'],
            'items'                => $validated['items'],
            'status'               => 'pending',
        ]);

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
            $targetUsers = User::where('department_id', $validated['target_department_id'])->get();
            if ($targetUsers->isNotEmpty()) {
                Mail::to($targetUsers)->send(new AssetRequestNotification($assetRequest));
            }
        }

        return back()->with('success', 'Asset request submitted.');
    }
}

