<?php

namespace App\Http\Controllers;

use App\Models\AssetRequest;
use App\Models\User;
use App\Mail\AssetRequestNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class AssetRequestController extends Controller
{
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

        // Find users in the target department (ideally managers/admins, but here we'll send to all or an admin)
        $targetUsers = User::where('department_id', $validated['target_department_id'])->get();
        
        if ($targetUsers->isNotEmpty()) {
            Mail::to($targetUsers)->send(new AssetRequestNotification($assetRequest));
        }

        return back()->with('success', 'Asset request submitted and email sent to the responsible department.');
    }
}
