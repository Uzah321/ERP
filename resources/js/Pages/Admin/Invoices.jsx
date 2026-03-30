import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Invoices({ invoices, uninvoicedPos, filters, flash }) {
    const [search, setSearch]           = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');
    const [showForm, setShowForm]       = useState(false);
    const [payModal, setPayModal]       = useState(null); // invoice object
    const [form, setForm] = useState({
        purchase_order_id: '',
        invoice_number: '',
        invoice_date: new Date().toISOString().slice(0, 10),
        due_date: '',
        amount: '',
        vat_amount: '',
        notes: '',
    });
    const [payForm, setPayForm] = useState({
        paid_at: new Date().toISOString().slice(0, 10),
        payment_reference: '',
        payment_method: 'EFT',
    });

    function doSearch(q, s) {
        setSearch(q); setStatusFilter(s);
        router.get(route('invoices.index'), { search: q, status: s }, {
            only: ['invoices', 'filters'],
            preserveState: true,
            replace: true,
        });
    }

    function selectPo(poId) {
        const po = uninvoicedPos.find(p => p.id === Number(poId));
        if (!po) { setForm(f => ({ ...f, purchase_order_id: poId, amount: '', vat_amount: '' })); return; }
        setForm(f => ({
            ...f,
            purchase_order_id: po.id,
            amount:     (Number(po.total_amount) - Number(po.vat_amount)).toFixed(2),
            vat_amount: Number(po.vat_amount).toFixed(2),
        }));
    }

    function submitInvoice(e) {
        e.preventDefault();
        router.post(route('invoices.store'), form, {
            onSuccess: () => { setShowForm(false); setForm({ purchase_order_id: '', invoice_number: '', invoice_date: new Date().toISOString().slice(0, 10), due_date: '', amount: '', vat_amount: '', notes: '' }); }
        });
    }

    function submitPayment(e) {
        e.preventDefault();
        router.patch(route('invoices.mark-paid', payModal.id), payForm, {
            onSuccess: () => setPayModal(null),
        });
    }

    const statusBadge = (s) => {
        const map = {
            pending:  'bg-yellow-100 text-yellow-800',
            paid:     'bg-green-100 text-green-800',
            overdue:  'bg-red-100 text-red-800',
            disputed: 'bg-orange-100 text-orange-800',
        };
        return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[s] ?? 'bg-gray-100 text-gray-700'}`}>{s}</span>;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Invoices & Payments" />
            <div className="p-6 space-y-6">

                {/* Flash */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">{flash.error}</div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">Invoices &amp; Payments</h1>
                    <button onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                        + Record Invoice
                    </button>
                </div>

                {/* Uninvoiced POs alert */}
                {uninvoicedPos.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
                        <strong>{uninvoicedPos.length}</strong> delivered PO{uninvoicedPos.length > 1 ? 's' : ''} awaiting invoice: {uninvoicedPos.map(p => `PO #${p.po_number}`).join(', ')}
                    </div>
                )}

                {/* ── INVOICE FORM ──────────────────────────────────────────── */}
                {showForm && (
                    <div className="bg-white border border-blue-200 rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-blue-800">Record Invoice</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                        </div>
                        <form onSubmit={submitInvoice} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Purchase Order *</label>
                                    <select value={form.purchase_order_id} onChange={e => selectPo(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" required>
                                        <option value="">— Select PO —</option>
                                        {uninvoicedPos.map(p => (
                                            <option key={p.id} value={p.id}>PO #{p.po_number} · {p.vendor_name} · {p.rtp_reference}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Invoice Number *</label>
                                    <input type="text" value={form.invoice_number} placeholder="e.g. INV-2026-0042"
                                        onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Invoice Date *</label>
                                    <input type="date" value={form.invoice_date} onChange={e => setForm(f => ({ ...f, invoice_date: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Due Date</label>
                                    <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Amount (excl. VAT, USD) *</label>
                                    <input type="number" step="0.01" min="0" value={form.amount}
                                        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">VAT Amount (USD)</label>
                                    <input type="number" step="0.01" min="0" value={form.vat_amount}
                                        onChange={e => setForm(f => ({ ...f, vat_amount: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none" />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="px-5 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
                                    Save Invoice
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── INVOICE TABLE ─────────────────────────────────────────── */}
                <div>
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <input type="text" placeholder="Search invoice #, vendor or CAPEX ref…" value={search}
                            onChange={e => doSearch(e.target.value, statusFilter)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-72 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
                        <select value={statusFilter} onChange={e => doSearch(search, e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400">
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                            <option value="disputed">Disputed</option>
                        </select>
                    </div>

                    {invoices.data.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No invoices recorded yet.</p>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                            {['Invoice #', 'PO #', 'Vendor', 'CAPEX Ref', 'Date', 'Due', 'Amount (USD)', 'VAT (USD)', 'PO Match', 'Status', 'Action'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {invoices.data.map(inv => (
                                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-gray-800">{inv.invoice_number}</td>
                                            <td className="px-4 py-3 font-mono">{inv.po_number}</td>
                                            <td className="px-4 py-3 text-gray-700">{inv.vendor_name}</td>
                                            <td className="px-4 py-3 text-gray-600 text-xs">{inv.rtp_reference}</td>
                                            <td className="px-4 py-3 text-gray-600">{inv.invoice_date}</td>
                                            <td className="px-4 py-3 text-gray-600">{inv.due_date || '—'}</td>
                                            <td className="px-4 py-3 font-semibold">${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-4 py-3 text-gray-600">${Number(inv.vat_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-4 py-3">
                                                {inv.amount_mismatch
                                                    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800" title={`Invoice $${Number(inv.amount).toFixed(2)} ≠ PO net $${Number(inv.po_total_amount).toFixed(2)}`}>⚠ Mismatch</span>
                                                    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">✓ Match</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3">{statusBadge(inv.status)}</td>
                                            <td className="px-4 py-3">
                                                {inv.status !== 'paid' && (
                                                    <button onClick={() => { setPayModal(inv); setPayForm({ paid_at: new Date().toISOString().slice(0, 10), payment_reference: '', payment_method: 'EFT' }); }}
                                                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                                                        Mark Paid
                                                    </button>
                                                )}
                                                {inv.status === 'paid' && (
                                                    <span className="text-xs text-gray-400">Paid {inv.paid_at} via {inv.payment_method}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {invoices.links?.length > 3 && (
                        <div className="flex justify-center mt-4 gap-1">
                            {invoices.links.map((link, i) => (
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

            {/* ── PAY MODAL ──────────────────────────────────────────────── */}
            {payModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-gray-800">Mark Invoice as Paid</h2>
                            <button onClick={() => setPayModal(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Invoice <strong>{payModal.invoice_number}</strong> — ${Number(payModal.amount).toLocaleString()} + VAT</p>
                        <form onSubmit={submitPayment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Payment Date *</label>
                                <input type="date" value={payForm.paid_at} onChange={e => setPayForm(f => ({ ...f, paid_at: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" required />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Payment Method</label>
                                <select value={payForm.payment_method} onChange={e => setPayForm(f => ({ ...f, payment_method: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400">
                                    <option>EFT</option>
                                    <option>Cheque</option>
                                    <option>Cash</option>
                                    <option>Card</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Payment Reference</label>
                                <input type="text" value={payForm.payment_reference} placeholder="e.g. TRN-00123"
                                    onChange={e => setPayForm(f => ({ ...f, payment_reference: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setPayModal(null)}
                                    className="px-5 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors">
                                    Confirm Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
