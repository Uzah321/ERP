<?php

namespace App\Http\Controllers;

use App\Models\Disposal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DisposalController extends Controller
{
    public function index()
    {
        $disposals = Disposal::with(['asset', 'user'])
            ->latest()
            ->get()
            ->map(function ($disposal) {
                return [
                    'id' => $disposal->id,
                    'asset_name' => $disposal->asset ? $disposal->asset->name : 'Unknown',
                    'asset_barcode' => $disposal->asset ? $disposal->asset->barcode : '-',
                    'user_name' => $disposal->user ? $disposal->user->name : 'System',
                    'method' => $disposal->method,
                    'reason' => $disposal->reason,
                    'recovery_amount' => $disposal->recovery_amount,
                    'created_at' => $disposal->created_at->format('Y-m-d'),
                ];
            });

        return Inertia::render('Lifecycle/DisposalLog', [
            'disposals' => $disposals
        ]);
    }
}

