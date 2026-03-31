<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\CapexForm;
use App\Models\Department;
use App\Models\Invoice;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ExecutiveDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $totalAssets = Asset::withoutTrashed()->count();
        $totalValue = Asset::withoutTrashed()->sum('purchase_cost');

        $assetsByStatus = Asset::withoutTrashed()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $assetsByDepartment = Asset::withoutTrashed()
            ->join('departments', 'assets.department_id', '=', 'departments.id')
            ->select('departments.name', DB::raw('count(assets.id) as count'))
            ->groupBy('departments.name')
            ->orderByDesc('count')
            ->get();

        $procurement = [
            'pending_capex' => CapexForm::whereNotIn('status', ['approved', 'declined'])->count(),
            'approved_waiting_po' => CapexForm::where('status', 'approved')->whereDoesntHave('purchaseOrders')->count(),
            'open_purchase_orders' => PurchaseOrder::whereIn('delivery_status', ['open', 'partial'])->count(),
            'pending_invoices' => PurchaseOrder::where('delivery_status', 'delivered')->where('invoice_status', 'pending')->count(),
            'overdue_invoices' => Invoice::where('status', 'pending')->whereDate('due_date', '<', now()->toDateString())->count(),
            'ytd_spend' => PurchaseOrder::sum('total_amount'),
        ];

        $recentPurchases = PurchaseOrder::with(['capexForm.assetRequest.department'])
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (PurchaseOrder $order) => [
                'id' => $order->id,
                'po_number' => $order->po_number,
                'vendor_name' => $order->vendor_name,
                'department' => $order->capexForm?->assetRequest?->department?->name ?? '-',
                'delivery_status' => $order->delivery_status,
                'invoice_status' => $order->invoice_status,
                'total_amount' => $order->total_amount,
                'created_at' => $order->created_at?->format('Y-m-d'),
            ]);

        $topDepartments = Department::withCount('assets')
            ->orderByDesc('assets_count')
            ->limit(5)
            ->get(['id', 'name'])
            ->map(fn (Department $department) => [
                'id' => $department->id,
                'name' => $department->name,
                'assets_count' => $department->assets_count,
            ]);

        return Inertia::render('Executive/Dashboard', [
            'metrics' => [
                'total_assets' => $totalAssets,
                'total_value' => $totalValue,
                ...$procurement,
            ],
            'chart_data' => [
                'status' => $assetsByStatus,
                'department' => $assetsByDepartment,
            ],
            'recent_purchases' => $recentPurchases,
            'top_departments' => $topDepartments,
        ]);
    }
}