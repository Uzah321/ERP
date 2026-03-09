<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\TransferRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TransferRequestController extends Controller
{
    public function index()
    {
        // Fetch all pending transfers (in a real app, you might restrict to managers of target departments)
        $transfers = TransferRequest::with(['asset', 'requester', 'targetDepartment', 'targetLocation'])
            ->where('status', 'pending')
            ->latest()
            ->get();

        return inertia('Transfers', [
            'transfers' => $transfers
        ]);
    }

    public function store(Request $request, Asset $asset)
    {
        $request->validate([
            'target_user_id' => 'required_without:target_location_id|exists:users,id',
            'target_location_id' => 'required_without:target_user_id|exists:locations,id',
            'target_department_id' => 'required|exists:departments,id',
            'reason' => 'required|string',
            'document' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
        ]);

        $path = null;
        if ($request->hasFile('document')) {
            $path = $request->file('document')->store('transfer_documents', 'public');
        }

        $transfer = TransferRequest::create([
            'asset_id' => $asset->id,
            'requested_by' => Auth::id(),
            'target_user_id' => $request->target_user_id,
            'target_location_id' => $request->target_location_id,
            'target_department_id' => $request->target_department_id,
            'reason' => $request->reason,
            'document_path' => $path,
            'status' => 'pending'
        ]);

        activity()
            ->performedOn($asset)
            ->causedBy(Auth::user())
            ->log('Transfer Requested');

        return redirect()->back()->with('success', 'Transfer request submitted successfully.');
    }

    public function update(Request $request, TransferRequest $transferRequest)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,completed'
        ]);

        $transferRequest->update(['status' => $request->status]);

        if ($request->status === 'approved') {
            $asset = $transferRequest->asset;
            $asset->update([
                'user_id' => $transferRequest->target_user_id ?? $asset->user_id,
                'location_id' => $transferRequest->target_location_id ?? $asset->location_id,
                'department_id' => $transferRequest->target_department_id ?? $asset->department_id,
            ]);

            activity()
                ->performedOn($asset)
                ->causedBy(Auth::user())
                ->log('Transfer Approved & Asset Moved');
        } else {
             activity()
                ->performedOn($transferRequest->asset)
                ->causedBy(Auth::user())
                ->log('Transfer ' . ucfirst($request->status));
        }

        return redirect()->back()->with('success', 'Transfer request updated.');
    }
}
