<?php

namespace App\Http\Controllers;

use App\Models\CapexForm;
use App\Models\Invoice;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProcurementDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $pendingCapex = CapexForm::whereNotIn('status', ['approved', 'declined'])->count();
        $approvedAwaitingPo = CapexForm::where('status', 'approved')->whereDoesntHave('purchaseOrders')->count();
        $openPurchaseOrders = PurchaseOrder::whereIn('delivery_status', ['open', 'partial'])->count();
        $deliveredAwaitingInvoice = PurchaseOrder::where('delivery_status', 'delivered')->where('invoice_status', 'pending')->count();
        $overdueInvoices = Invoice::where('status', 'pending')->whereDate('due_date', '<', now()->toDateString())->count();
        $paidThisMonth = Invoice::where('status', 'paid')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum(DB::raw('amount + vat_amount'));

        $recentOrders = PurchaseOrder::with(['capexForm.assetRequest.department'])
            ->latest()
            ->limit(8)
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

        return Inertia::render('Procurement/Dashboard', [
            'metrics' => [
                'pending_capex' => $pendingCapex,
                'approved_waiting_po' => $approvedAwaitingPo,
                'open_purchase_orders' => $openPurchaseOrders,
                'delivered_waiting_invoice' => $deliveredAwaitingInvoice,
                'overdue_invoices' => $overdueInvoices,
                'paid_this_month' => $paidThisMonth,
            ],
            'recent_orders' => $recentOrders,
        ]);
    }

    public function pending(Request $request): Response
    {
        $pendingCapex = CapexForm::with(['assetRequest.department'])
            ->whereNotIn('status', ['approved', 'declined'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (CapexForm $form) => [
                'id' => $form->id,
                'reference' => $form->rtp_reference,
                'department' => $form->assetRequest?->department?->name ?? '-',
                'status' => $form->status,
                'total_amount' => $form->total_amount,
                'created_at' => $form->created_at?->format('Y-m-d'),
            ]);

        $approvedAwaitingPo = CapexForm::with(['assetRequest.department'])
            ->where('status', 'approved')
            ->whereDoesntHave('purchaseOrders')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (CapexForm $form) => [
                'id' => $form->id,
                'reference' => $form->rtp_reference,
                'department' => $form->assetRequest?->department?->name ?? '-',
                'total_amount' => $form->total_amount,
                'created_at' => $form->created_at?->format('Y-m-d'),
            ]);

        $openReceipts = PurchaseOrder::with(['capexForm.assetRequest.department'])
            ->whereIn('delivery_status', ['open', 'partial'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (PurchaseOrder $order) => [
                'id' => $order->id,
                'po_number' => $order->po_number,
                'vendor_name' => $order->vendor_name,
                'department' => $order->capexForm?->assetRequest?->department?->name ?? '-',
                'delivery_status' => $order->delivery_status,
                'total_amount' => $order->total_amount,
                'created_at' => $order->created_at?->format('Y-m-d'),
            ]);

        $awaitingInvoices = PurchaseOrder::with(['capexForm.assetRequest.department'])
            ->where('delivery_status', 'delivered')
            ->where('invoice_status', 'pending')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (PurchaseOrder $order) => [
                'id' => $order->id,
                'po_number' => $order->po_number,
                'vendor_name' => $order->vendor_name,
                'department' => $order->capexForm?->assetRequest?->department?->name ?? '-',
                'total_amount' => $order->total_amount,
                'created_at' => $order->created_at?->format('Y-m-d'),
            ]);

        $unpaidInvoices = Invoice::with(['purchaseOrder.capexForm.assetRequest.department'])
            ->where('status', 'pending')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (Invoice $invoice) => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'po_number' => $invoice->purchaseOrder?->po_number ?? '-',
                'vendor_name' => $invoice->purchaseOrder?->vendor_name ?? '-',
                'department' => $invoice->purchaseOrder?->capexForm?->assetRequest?->department?->name ?? '-',
                'status' => $invoice->status,
                'amount' => ($invoice->amount ?? 0) + ($invoice->vat_amount ?? 0),
                'due_date' => optional($invoice->due_date)->format('Y-m-d'),
            ]);

        return Inertia::render('Procurement/PendingPurchases', [
            'pending_capex' => $pendingCapex,
            'approved_waiting_po' => $approvedAwaitingPo,
            'open_receipts' => $openReceipts,
            'awaiting_invoices' => $awaitingInvoices,
            'unpaid_invoices' => $unpaidInvoices,
        ]);
    }
}