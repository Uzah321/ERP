<?php

namespace App\Http\Controllers;

use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Models\Asset;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GoodsReceiptController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');

        // Open / partially delivered POs
        $pendingPos = PurchaseOrder::with(['capexForm'])
            ->whereIn('delivery_status', ['open', 'partial'])
            ->when($search, fn ($q) =>
                $q->where('vendor_name', 'like', "%{$search}%")
                  ->orWhereHas('capexForm', fn ($q2) =>
                      $q2->where('rtp_reference', 'like', "%{$search}%")
                  )
            )
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($po) => [
                'id'              => $po->id,
                'po_number'       => $po->po_number,
                'vendor_name'     => $po->vendor_name,
                'rtp_reference'   => $po->capexForm->rtp_reference ?? '',
                'delivery_status' => $po->delivery_status,
                'items'           => $po->items,
                'total_amount'    => $po->total_amount,
            ]);

        // Past receipts
        $receipts = GoodsReceipt::with(['purchaseOrder.capexForm', 'receiver'])
            ->when($search, fn ($q) =>
                $q->whereHas('purchaseOrder', fn ($q2) =>
                    $q2->where('vendor_name', 'like', "%{$search}%")
                       ->orWhereHas('capexForm', fn ($q3) =>
                           $q3->where('rtp_reference', 'like', "%{$search}%")
                       )
                )
            )
            ->orderByDesc('created_at')
            ->paginate(15)
            ->through(fn ($r) => [
                'id'                => $r->id,
                'po_number'         => $r->purchaseOrder->po_number ?? '',
                'vendor_name'       => $r->purchaseOrder->vendor_name ?? '',
                'rtp_reference'     => $r->purchaseOrder->capexForm->rtp_reference ?? '',
                'received_at'       => $r->received_at?->format('Y-m-d'),
                'delivery_note_no'  => $r->delivery_note_no,
                'status'            => $r->status,
                'received_by_name'  => $r->receiver->name ?? '',
                'items'             => $r->items,
                'condition_notes'   => $r->condition_notes,
                'notes'             => $r->notes,
            ]);

        return Inertia::render('Admin/GoodsReceipts', [
            'pendingPos' => $pendingPos,
            'receipts'   => $receipts,
            'filters'    => ['search' => $search],
            'flash'      => session('flash', []),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'purchase_order_id' => 'required|exists:purchase_orders,id',
            'received_at'       => 'required|date',
            'delivery_note_no'  => 'nullable|string|max:100',
            'status'            => 'required|in:partial,complete',
            'items'             => 'required|array|min:1',
            'items.*.description'   => 'required|string',
            'items.*.qty_ordered'   => 'required|numeric|min:0',
            'items.*.qty_received'  => 'required|numeric|min:0',
            'items.*.unit_price'    => 'required|numeric|min:0',
            'condition_notes'   => 'nullable|string|max:1000',
            'notes'             => 'nullable|string|max:1000',
        ]);

        $po = PurchaseOrder::with('capexForm')->findOrFail($data['purchase_order_id']);

        $receipt = GoodsReceipt::create([
            'purchase_order_id' => $data['purchase_order_id'],
            'received_by'       => Auth::id(),
            'received_at'       => $data['received_at'],
            'delivery_note_no'  => $data['delivery_note_no'] ?? null,
            'status'            => $data['status'],
            'items'             => $data['items'],
            'condition_notes'   => $data['condition_notes'] ?? null,
            'notes'             => $data['notes'] ?? null,
        ]);

        // Update PO delivery status
        $po->update([
            'delivery_status' => $data['status'] === 'complete' ? 'delivered' : 'partial',
        ]);

        // Auto-create Asset records on complete delivery
        if ($data['status'] === 'complete') {
            foreach ($data['items'] as $item) {
                $qty = (int) ($item['qty_received'] ?? 0);
                for ($i = 0; $i < $qty; $i++) {
                    Asset::create([
                        'name'              => $item['description'],
                        'purchase_cost'     => $item['unit_price'],
                        'purchase_date'     => $data['received_at'],
                        'department_id'     => $po->capexForm?->assetRequest?->department_id,
                        'status'            => 'Purchased',
                        'condition'         => 'New',
                        'order_number'      => 'PO-' . $po->po_number,
                        'goods_receipt_id'  => $receipt->id,
                    ]);
                }
            }
        }

        return redirect()->route('goods-receipts.index')
            ->with('flash', ['success' => 'Goods receipt recorded' . ($data['status'] === 'complete' ? ' — assets created automatically.' : '.')]);
    }
}
