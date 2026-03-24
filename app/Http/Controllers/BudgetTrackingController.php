<?php

namespace App\Http\Controllers;

use App\Models\CapexForm;
use App\Models\Department;
use App\Models\Invoice;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BudgetTrackingController extends Controller
{
    public function index(Request $request)
    {
        $departmentId = $request->input('department_id');
        $year         = $request->input('year', now()->year);

        $departments = Department::orderBy('name')->get(['id', 'name']);

        // All CAPEX forms, optionally filtered by year and department
        $capexQuery = CapexForm::with([
            'assetRequest.department',
            'assetRequest.user',
            'approvals',
        ])
        ->whereYear('created_at', $year)
        ->when($departmentId, function ($q) use ($departmentId) {
            $q->whereHas('assetRequest', fn ($r) => $r->where('department_id', $departmentId));
        });

        $capexForms = $capexQuery->get();

        // Build rows: one row per CAPEX form
        $rows = $capexForms->map(function ($capex) {
            $po = $capex->purchaseOrders()->first();  // 1 PO per CAPEX
            $invoiceTotal = 0;
            if ($po) {
                $invoiceTotal = Invoice::where('purchase_order_id', $po->id)->sum('amount');
            }

            $budgeted   = (float) ($capex->total_amount ?? 0);
            $poAmount   = $po ? (float) $po->total_amount : 0;
            $invoiced   = (float) $invoiceTotal;
            $variance   = $budgeted - $poAmount;

            return [
                'id'             => $capex->id,
                'rtp_reference'  => $capex->rtp_reference,
                'department'     => $capex->assetRequest->department?->name ?? '-',
                'requested_by'   => $capex->assetRequest->user?->name ?? '-',
                'status'         => $capex->status,
                'budgeted'       => $budgeted,
                'po_amount'      => $poAmount,
                'po_number'      => $po?->po_number,
                'invoiced'       => $invoiced,
                'variance'       => $variance,
                'created_at'     => $capex->created_at->format('d M Y'),
            ];
        });

        // Summary totals
        $summary = [
            'total_budgeted' => $rows->sum('budgeted'),
            'total_po'       => $rows->sum('po_amount'),
            'total_invoiced' => $rows->sum('invoiced'),
            'total_variance' => $rows->sum('variance'),
        ];

        // Department rollup for bar chart
        $byDepartment = $rows->groupBy('department')->map(function ($group, $dept) {
            return [
                'department'     => $dept,
                'total_budgeted' => $group->sum('budgeted'),
                'total_po'       => $group->sum('po_amount'),
                'total_invoiced' => $group->sum('invoiced'),
            ];
        })->values();

        return Inertia::render('Admin/BudgetTracking', [
            'rows'        => $rows->values(),
            'summary'     => $summary,
            'byDepartment'=> $byDepartment,
            'departments' => $departments,
            'filters'     => [
                'department_id' => $departmentId,
                'year'          => (int) $year,
            ],
        ]);
    }
}
