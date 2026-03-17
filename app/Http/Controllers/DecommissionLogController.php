<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DecommissionLogController extends Controller
{
    public function index()
    {
        $assets = Asset::with(['category', 'location', 'department'])
            ->where('status', 'Decommissioned')
            ->latest()
            ->get();

        return Inertia::render('Lifecycle/DecommissionLog', [
            'assets' => $assets
        ]);
    }
}

