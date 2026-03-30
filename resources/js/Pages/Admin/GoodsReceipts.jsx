import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function GoodsReceipts({ pendingPos, receipts, filters, flash }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [selectedPo, setSelectedPo] = useState(null);
    const [form, setForm] = useState({
        purchase_order_id: '',
        received_at: new Date().toISOString().slice(0, 10),
        delivery_note_no: '',
        status: 'complete',
        items: [],
        condition_notes: '',
        notes: '',
    });

    function selectPo(po) {
        setSelectedPo(po);
        const items = (po.items || []).map(it => ({
            description: it.description,
            qty_ordered:  Number(it.qty),
            qty_received: Number(it.qty),
            unit_price:   Number(it.unit_price),
        }));
        setForm(f => ({ ...f, purchase_order_id: po.id, items }));
    }

    function setItemQty(idx, val) {
        setForm(f => {
            const items = [...f.items];
            items[idx] = { ...items[idx], qty_received: Number(val) };
            return { ...f, items };
        });
    }

    function submit(e) {
        e.preventDefault();
        router.post(route('goods-receipts.store'), form);
    }

    function doSearch(q) {
        setSearch(q);
        router.get(route('goods-receipts.index'), { search: q }, {
            only: ['pendingPos', 'receipts', 'filters'],
            preserveState: true,
            replace: true,
        });
    }

    const statusBadge = (s) => {
        const map = {
            partial:  'bg-yellow-100 text-yellow-800',
            complete: 'bg-green-100 text-green-800',
            open:     'bg-gray-100 text-gray-700',
            delivered:'bg-blue-100 text-blue-800',
        };
        return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[s] ?? 'bg-gray-100 text-gray-700'}`}>{s}</span>;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Goods Receipts" />
            <div className="p-6 space-y-8">

                {/* Flash */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">{flash.error}</div>
                )}

                {/* ── PENDING POs ──────────────────────────────────────────── */}
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-3">Open Purchase Orders Awaiting Delivery</h2>
                    {pendingPos.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">All purchase orders have been fully delivered.</p>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        {['PO #', 'CAPEX Ref', 'Vendor', 'Total (USD)', 'Delivery Status', 'Action'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingPos.map(po => (
                                        <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-mono font-semibold text-gray-800">{po.po_number}</td>
                                            <td className="px-4 py-3 text-gray-600">{po.rtp_reference}</td>
                                            <td className="px-4 py-3 text-gray-700">{po.vendor_name}</td>
                                            <td className="px-4 py-3 font-semibold">${Number(po.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-4 py-3">{statusBadge(po.delivery_status)}</td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => selectPo(po)}
                                                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Record Receipt
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ── RECEIPT FORM ─────────────────────────────────────────── */}
                {selectedPo && (
                    <div className="bg-white border border-blue-200 rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-blue-800">
                                Record Delivery — PO #{selectedPo.po_number} · {selectedPo.vendor_name}
                            </h2>
                            <button onClick={() => setSelectedPo(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Date Received *</label>
                                    <input type="date" value={form.received_at} onChange={e => setForm(f => ({ ...f, received_at: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Delivery Note No.</label>
                                    <input type="text" value={form.delivery_note_no} placeholder="e.g. DN-20260324-001"
                                        onChange={e => setForm(f => ({ ...f, delivery_note_no: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Receipt Status *</label>
                                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none" required>
                                        <option value="complete">Complete Delivery</option>
                                        <option value="partial">Partial Delivery</option>
                                    </select>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-2">Items Received</label>
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                {['Description', 'Qty Ordered', 'Qty Received', 'Unit Price (USD)'].map(h => (
                                                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {form.items.map((it, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-3 py-2 text-gray-700">{it.description}</td>
                                                    <td className="px-3 py-2 text-center">{it.qty_ordered}</td>
                                                    <td className="px-3 py-2 w-28">
                                                        <input type="number" min={0} max={it.qty_ordered}
                                                            value={it.qty_received}
                                                            onChange={e => setItemQty(idx, e.target.value)}
                                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none" />
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-600">${Number(it.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Condition Notes</label>
                                    <textarea value={form.condition_notes} rows={2}
                                        placeholder="e.g. packaging damaged, item in good condition..."
                                        onChange={e => setForm(f => ({ ...f, condition_notes: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none resize-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Additional Notes</label>
                                    <textarea value={form.notes} rows={2}
                                        placeholder="Any other notes..."
                                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none resize-none" />
                                </div>
                            </div>

                            {form.status === 'complete' && (
                                <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg px-4 py-3">
                                    <strong>Auto-create assets:</strong> On complete delivery, one asset record will be created per unit received and linked to the relevant department.
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setSelectedPo(null)}
                                    className="px-5 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
                                    Save Receipt
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── PAST RECEIPTS ─────────────────────────────────────────── */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-gray-800">Receipt History</h2>
                        <input
                            type="text"
                            placeholder="Search vendor or CAPEX ref…"
                            value={search}
                            onChange={e => doSearch(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-64 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                        />
                    </div>

                    {receipts.data.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No receipts recorded yet.</p>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        {['PO #', 'CAPEX Ref', 'Vendor', 'Received Date', 'Delivery Note', 'Status', 'Received By', 'Conditions'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {receipts.data.map(r => (
                                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-mono font-semibold text-gray-800">{r.po_number}</td>
                                            <td className="px-4 py-3 text-gray-600">{r.rtp_reference}</td>
                                            <td className="px-4 py-3 text-gray-700">{r.vendor_name}</td>
                                            <td className="px-4 py-3 text-gray-600">{r.received_at}</td>
                                            <td className="px-4 py-3 text-gray-600">{r.delivery_note_no || '—'}</td>
                                            <td className="px-4 py-3">{statusBadge(r.status)}</td>
                                            <td className="px-4 py-3 text-gray-600">{r.received_by_name}</td>
                                            <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{r.condition_notes || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {receipts.links?.length > 3 && (
                        <div className="flex justify-center mt-4 gap-1">
                            {receipts.links.map((link, i) => (
                                link.url ? (
                                    <Link key={i} href={link.url}
                                        className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${link.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span key={i} className="px-3 py-1.5 rounded text-xs border border-gray-200 text-gray-300"
                                        dangerouslySetInnerHTML={{ __html: link.label }} />
                                )
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
