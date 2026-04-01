<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Support\DashboardOverviewService;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(Request $request, DashboardOverviewService $dashboardOverviewService): Response
    {
        $overview = $dashboardOverviewService->build();

        return Inertia::render('Admin/Dashboard', [
            ...$overview,
        ]);
    }
}
