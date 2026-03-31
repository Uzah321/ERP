<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetAllocation;
use App\Models\Department;
use App\Models\TransferRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AssetAllocationController extends Controller
{
    public function index()
    {
        $allocations = AssetAllocation::with(['asset', 'department', 'user', 'allocator'])
            ->latest()
            ->get();

        $pendingTransfers = TransferRequest::with([
            'asset',
            'requester',
            'targetDepartment',
            'targetLocation',
            'targetUser',
        ])
            ->where('status', 'pending')
            ->latest()
            ->get();

        $assets = Asset::select('id', 'name', 'barcode', 'status')->orderBy('name')->get();
        $departments = Department::select('id', 'name')->orderBy('name')->get();
        $users = User::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/Allocations', [
            'allocations' => $allocations,
            'pendingTransfers' => $pendingTransfers,
            'assets' => $assets,
            'departments' => $departments,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'department_id' => 'nullable|exists:departments,id',
            'user_id' => 'nullable|exists:users,id',
            'allocated_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        AssetAllocation::create([
            'asset_id' => $request->asset_id,
            'department_id' => $request->department_id,
            'user_id' => $request->user_id,
            'allocated_by' => Auth::id(),
            'allocated_date' => $request->allocated_date,
            'notes' => $request->notes,
        ]);

        $asset = Asset::find($request->asset_id);
        $asset->update([
            'status' => 'Allocated',
            'department_id' => $request->department_id,
            'assigned_to' => $request->user_id,
        ]);

        activity()
            ->performedOn($asset)
            ->causedBy(Auth::user())
            ->log('Asset allocated to ' . ($request->user_id ? User::find($request->user_id)->name : 'department'));

        return redirect()->back()->with('success', 'Asset allocated successfully.');
    }

    public function returnAsset(Request $request, AssetAllocation $allocation)
    {
        $request->validate([
            'notes' => 'nullable|string',
        ]);

        $allocation->update([
            'returned_date' => now()->toDateString(),
            'notes' => $request->notes ?: $allocation->notes,
        ]);

        $allocation->asset->update([
            'status' => 'Available',
            'assigned_to' => null,
        ]);

        activity()
            ->performedOn($allocation->asset)
            ->causedBy(Auth::user())
            ->log('Asset returned from allocation');

        return redirect()->back()->with('success', 'Asset returned successfully.');
    }
}
