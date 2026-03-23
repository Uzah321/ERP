<?php

namespace App\Http\Controllers;

use App\Models\CapexForm;
use App\Models\PurchaseOrder;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    /**
     * List all purchase orders.
     */
    public function index()
    {
        $orders = PurchaseOrder::with(['capexForm.assetRequest.department'])
            ->latest()
            ->get()
            ->map(fn($po) => [
                'id'            => $po->id,
                'po_number'     => $po->po_number,
                'vendor_name'   => $po->vendor_name,
                'department'    => $po->capexForm->assetRequest->department?->name ?? '-',
                'total_amount'  => $po->total_amount,
                'vat_amount'    => $po->vat_amount,
                'items_count'   => count($po->items ?? []),
                'created_at'    => $po->created_at->format('d M Y'),
                'capex_ref'     => $po->capexForm->rtp_reference,
            ]);

        // Fully-approved CAPEX forms that don't yet have a PO
        $usedCapexIds = PurchaseOrder::pluck('capex_form_id')->toArray();
        $approvedCapex = CapexForm::with(['assetRequest.department', 'assetRequest.user', 'approvals'])
            ->where('status', 'approved')
            ->whereNotIn('id', $usedCapexIds)
            ->latest()
            ->get()
            ->map(fn($f) => [
                'id'           => $f->id,
                'rtp_reference'=> $f->rtp_reference,
                'department'   => $f->assetRequest->department?->name ?? '-',
                'requested_by' => $f->assetRequest->user?->name ?? '-',
                'total_amount' => $f->total_amount,
                'items'        => $f->items ?? [],
                'cost_allocation' => $f->cost_allocation,
            ]);

        return Inertia::render('Admin/PurchaseOrders', [
            'orders'        => $orders,
            'approvedCapex' => $approvedCapex,
            'nextPoNumber'  => PurchaseOrder::nextPoNumber(),
        ]);
    }

    /**
     * Create a new Purchase Order from a fully-approved CAPEX form.
     */
    public function store(Request $request)
    {
        $request->validate([
            'capex_form_id'    => 'required|exists:capex_forms,id',
            'vendor_name'      => 'required|string|max:255',
            'vendor_tin'       => 'nullable|string|max:100',
            'vendor_vat_number'=> 'nullable|string|max:100',
            'requisition_no'   => 'nullable|string|max:100',
            'items'            => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.qty'         => 'required|numeric|min:1',
            'items.*.unit_price'  => 'required|numeric|min:0',
            'vat_amount'       => 'nullable|numeric|min:0',
            'manager_name'     => 'nullable|string|max:255',
            'allocation'       => 'nullable|string|max:500',
            'authorised_by'    => 'nullable|string|max:255',
        ]);

        // Ensure the CAPEX is approved and doesn't already have a PO
        $capex = CapexForm::where('id', $request->capex_form_id)
            ->where('status', 'approved')
            ->firstOrFail();

        if (PurchaseOrder::where('capex_form_id', $capex->id)->exists()) {
            return back()->withErrors(['capex_form_id' => 'A Purchase Order already exists for this CAPEX form.']);
        }

        // Compute totals
        $items = collect($request->items)->map(function ($item) {
            $total = round($item['qty'] * $item['unit_price'], 2);
            return [
                'description' => $item['description'],
                'qty'         => $item['qty'],
                'unit_price'  => $item['unit_price'],
                'total'       => $total,
            ];
        })->toArray();

        $subtotal  = collect($items)->sum('total');
        $vatAmount = round($request->input('vat_amount', 0), 2);
        $total     = round($subtotal + $vatAmount, 2);

        $po = PurchaseOrder::create([
            'po_number'        => PurchaseOrder::nextPoNumber(),
            'capex_form_id'    => $capex->id,
            'vendor_name'      => $request->vendor_name,
            'vendor_tin'       => $request->vendor_tin,
            'vendor_vat_number'=> $request->vendor_vat_number,
            'requisition_no'   => $request->requisition_no,
            'items'            => $items,
            'vat_amount'       => $vatAmount,
            'total_amount'     => $total,
            'manager_name'     => $request->manager_name,
            'allocation'       => $request->allocation,
            'authorised_by'    => $request->authorised_by,
        ]);

        return back()->with('success', 'Purchase Order #' . $po->po_number . ' created successfully.');
    }

    /**
     * Download the Purchase Order as a PDF.
     */
    public function downloadPdf(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->loadMissing(['capexForm.assetRequest.department']);

        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $dompdf = new Dompdf($options);

        $html = view('pdf.purchase-order', ['po' => $purchaseOrder])->render();
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $filename = 'PO-' . $purchaseOrder->po_number . '.pdf';

        return response($dompdf->output(), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
