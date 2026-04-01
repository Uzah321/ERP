<?php

namespace App\Support;

use App\Models\CapexForm;
use App\Models\Invoice;
use App\Models\PurchaseOrder;
use Illuminate\Support\Facades\DB;

class ProcurementOverviewService
{
    public function metrics(): array
    {
        return [
            'pending_capex' => CapexForm::query()->whereNotIn('status', ['approved', 'declined'])->count(),
            'approved_waiting_po' => CapexForm::query()->where('status', 'approved')->whereDoesntHave('purchaseOrders')->count(),
            'open_purchase_orders' => PurchaseOrder::query()->whereIn('delivery_status', ['open', 'partial'])->count(),
            'pending_invoices' => PurchaseOrder::query()->where('delivery_status', 'delivered')->where('invoice_status', 'pending')->count(),
            'overdue_invoices' => Invoice::query()->where('status', 'pending')->whereDate('due_date', '<', now()->toDateString())->count(),
            'paid_this_month' => (float) Invoice::query()
                ->where('status', 'paid')
                ->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)
                ->sum(DB::raw('amount + vat_amount')),
            'ytd_spend' => (float) PurchaseOrder::query()->sum('total_amount'),
        ];
    }

    public function recentOrders(int $limit = 8): array
    {
        return PurchaseOrder::query()
            ->with(['capexForm.assetRequest.department'])
            ->latest()
            ->limit($limit)
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
            ])
            ->all();
    }

    public function alerts(array $metrics): array
    {
        return collect([
            $metrics['pending_capex'] > 0 ? [
                'id' => 'pending-capex',
                'title' => 'Approval forms awaiting progress',
                'description' => $metrics['pending_capex'] . ' CAPEX request(s) are still moving through approval.',
                'tone' => 'yellow',
                'cta' => 'Review CAPEX queue',
            ] : null,
            $metrics['pending_invoices'] > 0 ? [
                'id' => 'awaiting-invoices',
                'title' => 'Delivered orders awaiting invoice',
                'description' => $metrics['pending_invoices'] . ' delivered purchase order(s) still need invoice capture.',
                'tone' => 'blue',
                'cta' => 'Inspect invoice backlog',
            ] : null,
            $metrics['overdue_invoices'] > 0 ? [
                'id' => 'overdue-invoices',
                'title' => 'Overdue supplier invoices',
                'description' => $metrics['overdue_invoices'] . ' invoice(s) are past due and need payment attention.',
                'tone' => 'red',
                'cta' => 'Review overdue invoices',
            ] : null,
        ])->filter()->values()->all();
    }
}