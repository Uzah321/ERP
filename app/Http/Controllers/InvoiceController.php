<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $status = $request->input('status', '');

        $invoices = Invoice::with(['purchaseOrder.capexForm'])
            ->when($search, fn ($q) =>
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('purchaseOrder', fn ($q2) =>
                      $q2->where('vendor_name', 'like', "%{$search}%")
                         ->orWhereHas('capexForm', fn ($q3) =>
                             $q3->where('rtp_reference', 'like', "%{$search}%")
                         )
                  )
            )
            ->when($status, fn ($q) => $q->where('status', $status))
            ->orderByDesc('created_at')
            ->paginate(15)
            ->through(fn ($inv) => [
                'id'                => $inv->id,
                'invoice_number'    => $inv->invoice_number,
                'po_number'         => $inv->purchaseOrder->po_number ?? '',
                'vendor_name'       => $inv->purchaseOrder->vendor_name ?? '',
                'rtp_reference'     => $inv->purchaseOrder->capexForm->rtp_reference ?? '',
                'invoice_date'      => $inv->invoice_date?->format('Y-m-d'),
                'due_date'          => $inv->due_date?->format('Y-m-d'),
                'amount'            => $inv->amount,
                'vat_amount'        => $inv->vat_amount,
                'amount_mismatch'   => $inv->amount_mismatch,
                'po_total_amount'   => $inv->po_total_amount,
                'status'            => $inv->status,   // uses accessor (auto-overdue)
                'paid_at'           => $inv->paid_at?->format('Y-m-d'),
                'payment_reference' => $inv->payment_reference,
                'payment_method'    => $inv->payment_method,
                'notes'             => $inv->notes,
            ]);

        // POs that are delivered but don't yet have an invoice
        $uninvoicedPos = PurchaseOrder::with('capexForm')
            ->where('delivery_status', 'delivered')
            ->where('invoice_status', 'pending')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($po) => [
                'id'            => $po->id,
                'po_number'     => $po->po_number,
                'vendor_name'   => $po->vendor_name,
                'rtp_reference' => $po->capexForm->rtp_reference ?? '',
                'total_amount'  => $po->total_amount,
                'vat_amount'    => $po->vat_amount,
            ]);

        return Inertia::render('Admin/Invoices', [
            'invoices'      => $invoices,
            'uninvoicedPos' => $uninvoicedPos,
            'filters'       => ['search' => $search, 'status' => $status],
            'flash'         => session('flash', []),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'purchase_order_id' => 'required|exists:purchase_orders,id',
            'invoice_number'    => 'required|string|max:100|unique:invoices,invoice_number',
            'invoice_date'      => 'required|date',
            'due_date'          => 'nullable|date|after_or_equal:invoice_date',
            'amount'            => 'required|numeric|min:0',
            'vat_amount'        => 'nullable|numeric|min:0',
            'notes'             => 'nullable|string|max:1000',
        ]);

        $po = PurchaseOrder::findOrFail($data['purchase_order_id']);
        $poNet = (float) $po->total_amount - (float) $po->vat_amount;
        $invoiceNet = (float) $data['amount'];
        $mismatch = abs($invoiceNet - $poNet) > 0.01;

        Invoice::create([
            'purchase_order_id' => $data['purchase_order_id'],
            'invoice_number'    => $data['invoice_number'],
            'invoice_date'      => $data['invoice_date'],
            'due_date'          => $data['due_date'] ?? null,
            'amount'            => $data['amount'],
            'vat_amount'        => $data['vat_amount'] ?? 0,
            'status'            => 'pending',
            'amount_mismatch'   => $mismatch,
            'po_total_amount'   => $poNet,
            'notes'             => $data['notes'] ?? null,
        ]);

        // Mark PO as invoiced
        $po->update(['invoice_status' => 'invoiced']);

        $flash = $mismatch
            ? "Invoice {$data['invoice_number']} recorded — ⚠️ AMOUNT MISMATCH: invoice \${$data['amount']} vs PO net \${$poNet}."
            : "Invoice {$data['invoice_number']} recorded.";

        return redirect()->route('invoices.index')
            ->with('flash', ['success' => $flash]);
    }

    public function markPaid(Request $request, Invoice $invoice)
    {
        $data = $request->validate([
            'paid_at'           => 'required|date',
            'payment_reference' => 'nullable|string|max:200',
            'payment_method'    => 'nullable|in:EFT,Cheque,Cash,Card',
        ]);

        $invoice->update([
            'status'            => 'paid',
            'paid_at'           => $data['paid_at'],
            'payment_reference' => $data['payment_reference'] ?? null,
            'payment_method'    => $data['payment_method'] ?? null,
        ]);

        // Mark PO as paid
        $invoice->purchaseOrder?->update(['invoice_status' => 'paid']);

        return redirect()->route('invoices.index')
            ->with('flash', ['success' => "Invoice {$invoice->invoice_number} marked as paid."]);
    }
}
