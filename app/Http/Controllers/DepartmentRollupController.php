<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentRollupController extends Controller
{
    public function index()
    {
        $rollups = Department::withCount('assets')
            ->get()
            ->map(function ($dept) {
                return [
                    'id' => $dept->id,
                    'name' => $dept->name,
                    'asset_count' => $dept->assets_count,
                    'total_value' => $dept->assets()->sum('purchase_cost') ?? 0,
                ];
            });

        return Inertia::render('Reports/DepartmentRollup', [
            'rollups' => $rollups
        ]);
    }
}

