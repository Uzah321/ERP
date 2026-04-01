<?php

namespace App\Http\Controllers;

use App\Support\DashboardOverviewService;
use App\Support\ProcurementOverviewService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExecutiveDashboardController extends Controller
{
    public function index(
        Request $request,
        DashboardOverviewService $dashboardOverviewService,
        ProcurementOverviewService $procurementOverviewService
    ): Response
    {
        $overview = $dashboardOverviewService->build();

        $procurement = $procurementOverviewService->metrics();
        $overview['alerts'] = array_values(array_merge(
            $procurementOverviewService->alerts($procurement),
            $overview['alerts']
        ));

        return Inertia::render('Executive/Dashboard', [
            ...$overview,
            'procurement_metrics' => $procurement,
            'recent_purchases' => $procurementOverviewService->recentOrders(6),
        ]);
    }
}