<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Asset;
use App\Models\Department;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        $totalAssets = Asset::withoutTrashed()->count();
        $totalValue = Asset::withoutTrashed()->sum('purchase_cost');

        $assetsByStatus = Asset::withoutTrashed()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $assetsByCondition = Asset::withoutTrashed()
            ->select('condition', DB::raw('count(*) as count'))
            ->groupBy('condition')
            ->get();

        $assetsByDepartment = Asset::withoutTrashed()
            ->join('departments', 'assets.department_id', '=', 'departments.id')
            ->select('departments.name', DB::raw('count(assets.id) as count'))
            ->groupBy('departments.name')
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'total_assets' => $totalAssets,
                'total_value' => $totalValue,
            ],
            'chart_data' => [
                'status' => $assetsByStatus,
                'condition' => $assetsByCondition,
                'department' => $assetsByDepartment,
            ]
        ]);
    }
}
