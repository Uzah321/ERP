import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function PurchaseOrders({ auth, orders, approvedCapex, nextPoNumber, filters = {}, flash, vendors = [] }) {
    const [selectedCapex, setSelectedCapex] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [search, setSearch] = useState(filters.search ?? '');

    const doSearch = (q) => {
        router.get(route('purchase-orders.index'), { search: q }, {
            preserveState: true,
            replace: true,
            only: ['orders', 'filters'],
        });
    };

    // Form state
    const [form, setForm] = useState({
        vendor_name:           '',
        vendor_email:          '',
        vendor_tin:            '',
        vendor_vat_number:     '',
        requisition_no:        '',
        manager_name:          '',
        allocation:            '',
        authorised_by:         '',
        vat_amount:            '',
        payment_person_name:   '',
        payment_person_email:  '',
    });

    // Items rows
    const [items, setItems] = useState([
        { description: '', qty: 1, unit_price: '' },
    ]);

    const selectCapex = (capex) => {
        setSelectedCapex(capex);
        // Auto-fill requisition number from the CAPEX reference
        setForm(f => ({ ...f, requisition_no: capex.rtp_reference ?? '' }));
        // Pre-fill items: description = asset_type + requirements (if any)
        if (capex.items?.length > 0) {
            setItems(capex.items.map(i => {
                const type = i.asset_type ?? i.description ?? '';
                const reqs = i.requirements ? ` — ${i.requirements}` : '';
                return {
                    description: type + reqs,
                    qty:         i.quantity ?? 1,
                    unit_price:  i.unit_price ?? '',
                };
            }));
        } else {
            setItems([{ description: '', qty: 1, unit_price: '' }]);
        }
    };

    const updateItem = (index, field, value) => {
        setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const addItem = () => setItems(prev => [...prev, { description: '', qty: 1, unit_price: '' }]);
    const removeItem = (index) => {
        if (items.length <= 1) return;
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    // Computed totals
    const subtotal = items.reduce((sum, item) => {
        const qty   = parseFloat(item.qty) || 0;
        const price = parseFloat(item.unit_price) || 0;
        return sum + qty * price;
    }, 0);
    const vat   = parseFloat(form.vat_amount) || 0;
    const total = subtotal + vat;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedCapex) return;

        setSubmitting(true);
        setFormErrors({});

        router.post(route('purchase-orders.store'), {
            capex_form_id:         selectedCapex.id,
            vendor_name:           form.vendor_name,
            vendor_email:          form.vendor_email,
            vendor_tin:            form.vendor_tin,
            vendor_vat_number:     form.vendor_vat_number,
            requisition_no:        form.requisition_no,
            items:                 items,
            vat_amount:            form.vat_amount || 0,
            manager_name:          form.manager_name,
            allocation:            form.allocation,
            authorised_by:         form.authorised_by,
            payment_person_name:   form.payment_person_name,
            payment_person_email:  form.payment_person_email,
        }, {
            onSuccess: () => {
                setSelectedCapex(null);
                setForm({ vendor_name:'', vendor_email:'', vendor_tin:'', vendor_vat_number:'', requisition_no:'', manager_name:'', allocation:'', authorised_by:'', vat_amount:'', payment_person_name:'', payment_person_email:'' });
                setItems([{ description:'', qty:1, unit_price:'' }]);
                setFormErrors({});
            },
            onError: (errs) => setFormErrors(errs),
            onFinish: () => setSubmitting(false),
        });
    };

    const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none';

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-2xl font-bold text-gray-800">Purchase Orders</h2>}>
            <Head title="Purchase Orders" />
            <div className="p-6 space-y-6">

                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{flash.error}</div>
                )}

                {/* ── STEP 1: Choose CAPEX ── */}
                {approvedCapex?.length > 0 && !selectedCapex && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-base font-semibold text-gray-800 mb-1">Generate New Purchase Order</h3>
                        <p className="text-sm text-gray-500 mb-4">Select a fully-approved CAPEX form to generate a PO from.</p>
                        <div className="space-y-2">
                            {approvedCapex.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => selectCapex(c)}
                                    className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 text-sm hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                                >
                                    <span>
                                        <span className="font-mono font-semibold text-blue-700">{c.rtp_reference}</span>
                                        <span className="ml-3 text-gray-600">{c.department}</span>
                                        <span className="ml-3 text-gray-400">— {c.requested_by}</span>
                                    </span>
                                    <span className="font-semibold text-green-700">
                                        {c.total_amount ? `$${parseFloat(c.total_amount).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })}` : ''}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── STEP 2: Fill PO Form ── */}
                {selectedCapex && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        {/* Header mimicking the PO layout */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-semibold text-gray-800">
                                    Purchase Order &nbsp;
                                    <span className="text-red-600 font-bold text-xl">#{nextPoNumber}</span>
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">CAPEX: {selectedCapex.rtp_reference} — {selectedCapex.department}</p>
                            </div>
                            <button onClick={() => setSelectedCapex(null)} className="text-xs text-gray-400 hover:text-gray-700 underline">
                                ← Change CAPEX
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Vendor Details */}
                            <fieldset className="border border-gray-200 rounded-lg p-4">
                                <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Vendor Details</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor / Supplier Name <span className="text-red-500">*</span></label>
                                        <select
                                            value={form.vendor_name}
                                            onChange={e => {
                                                const selected = vendors.find(v => v.name === e.target.value);
                                                setForm(f => ({
                                                    ...f,
                                                    vendor_name:  e.target.value,
                                                    vendor_email: selected?.contact_email ?? f.vendor_email,
                                                }));
                                            }}
                                            className={inputCls}
                                            required
                                        >
                                            <option value="">Select a vendor…</option>
                                            {vendors.map(v => (
                                                <option key={v.id} value={v.name}>{v.name}</option>
                                            ))}
                                        </select>
                                        {formErrors.vendor_name && <p className="text-red-500 text-xs mt-1">{formErrors.vendor_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Vendor Email
                                            <span className="ml-1 text-xs text-gray-400 font-normal">(auto-filled from vendor list)</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={form.vendor_email}
                                            onChange={e => setForm(f => ({...f, vendor_email: e.target.value}))}
                                            className={inputCls}
                                            placeholder="auto-filled or enter manually"
                                        />
                                        {formErrors.vendor_email && <p className="text-red-500 text-xs mt-1">{formErrors.vendor_email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">TIN</label>
                                        <input type="text" value={form.vendor_tin} onChange={e => setForm(f => ({...f, vendor_tin: e.target.value}))} className={inputCls} placeholder="e.g. 2000231759" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">VAT Number</label>
                                        <input type="text" value={form.vendor_vat_number} onChange={e => setForm(f => ({...f, vendor_vat_number: e.target.value}))} className={inputCls} placeholder="e.g. 220006604" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Requisition No. <span className="text-gray-400 font-normal text-xs">(auto-filled from CAPEX ref)</span>
                                        </label>
                                        <input type="text" value={form.requisition_no} onChange={e => setForm(f => ({...f, requisition_no: e.target.value}))} className={inputCls} />
                                    </div>
                                </div>
                            </fieldset>

                            {/* Items */}
                            <fieldset className="border border-gray-200 rounded-lg p-4">
                                <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Goods / Services</legend>
                                <div className="overflow-x-auto mt-2">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                                <th className="border border-gray-200 px-3 py-2 text-center w-16">Qty</th>
                                                <th className="border border-gray-200 px-3 py-2 text-left">Description of Goods or Services</th>
                                                <th className="border border-gray-200 px-3 py-2 text-right w-32">Unit Price ($)</th>
                                                <th className="border border-gray-200 px-3 py-2 text-right w-32">Total Cost</th>
                                                <th className="border border-gray-200 px-3 py-2 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, i) => {
                                                const rowTotal = (parseFloat(item.qty)||0) * (parseFloat(item.unit_price)||0);
                                                return (
                                                    <tr key={i}>
                                                        <td className="border border-gray-200 px-2 py-1">
                                                            <input type="number" min="1" value={item.qty} onChange={e => updateItem(i,'qty',e.target.value)} className="w-full text-center border-0 text-sm focus:outline-none" />
                                                        </td>
                                                        <td className="border border-gray-200 px-2 py-1">
                                                            <input type="text" value={item.description} onChange={e => updateItem(i,'description',e.target.value)} className="w-full border-0 text-sm focus:outline-none" placeholder="Description…" required />
                                                        </td>
                                                        <td className="border border-gray-200 px-2 py-1">
                                                            <input type="number" step="0.01" min="0" value={item.unit_price} onChange={e => updateItem(i,'unit_price',e.target.value)} className="w-full text-right border-0 text-sm focus:outline-none" placeholder="0.00" />
                                                        </td>
                                                        <td className="border border-gray-200 px-3 py-1 text-right text-sm font-medium text-gray-700">
                                                            {rowTotal > 0 ? `$${rowTotal.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}` : '—'}
                                                        </td>
                                                        <td className="border border-gray-200 px-1 py-1 text-center">
                                                            {items.length > 1 && (
                                                                <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-base leading-none">&times;</button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="3" className="border border-gray-200 px-3 py-1 text-right text-xs font-semibold text-gray-600 bg-gray-50">VAT</td>
                                                <td className="border border-gray-200 px-2 py-1">
                                                    <input type="number" step="0.01" min="0" value={form.vat_amount} onChange={e => setForm(f=>({...f,vat_amount:e.target.value}))} className="w-full text-right border-0 text-sm focus:outline-none" placeholder="0.00" />
                                                </td>
                                                <td className="border border-gray-200"></td>
                                            </tr>
                                            <tr className="bg-gray-50">
                                                <td colSpan="3" className="border border-gray-200 px-3 py-2 text-right font-bold text-gray-800">TOTAL</td>
                                                <td className="border border-gray-200 px-3 py-2 text-right font-bold text-gray-900">
                                                    ${total.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
                                                </td>
                                                <td className="border border-gray-200"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <button type="button" onClick={addItem} className="mt-2 text-blue-600 hover:text-blue-800 text-xs font-medium">+ Add line item</button>
                            </fieldset>

                            {/* Signatories */}
                            <fieldset className="border border-gray-200 rounded-lg p-4">
                                <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Authorisation</legend>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                                        <input type="text" value={form.manager_name} onChange={e => setForm(f=>({...f,manager_name:e.target.value}))} className={inputCls} placeholder="Manager name" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Allocation</label>
                                        <input type="text" value={form.allocation} onChange={e => setForm(f=>({...f,allocation:e.target.value}))} className={inputCls} placeholder="Cost centre / allocation" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Authorised By</label>
                                        <input type="text" value={form.authorised_by} onChange={e => setForm(f=>({...f,authorised_by:e.target.value}))} className={inputCls} placeholder="Authorising officer" />
                                    </div>
                                </div>
                            </fieldset>

                            {/* Payment Person */}
                            <fieldset className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                                <legend className="text-xs font-semibold text-orange-600 uppercase tracking-wider px-2">Payment Officer</legend>
                                <p className="text-xs text-orange-700 mb-3 mt-1">
                                    This person will receive an email instructing them to process the payment to the vendor and notify the vendor to proceed with delivery.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Officer Name</label>
                                        <input type="text" value={form.payment_person_name} onChange={e => setForm(f=>({...f,payment_person_name:e.target.value}))} className={inputCls} placeholder="e.g. John Doe" />
                                        {formErrors.payment_person_name && <p className="text-red-500 text-xs mt-1">{formErrors.payment_person_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Officer Email</label>
                                        <input type="email" value={form.payment_person_email} onChange={e => setForm(f=>({...f,payment_person_email:e.target.value}))} className={inputCls} placeholder="finance@simbisa.co.zw" />
                                        {formErrors.payment_person_email && <p className="text-red-500 text-xs mt-1">{formErrors.payment_person_email}</p>}
                                    </div>
                                </div>
                            </fieldset>

                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setSelectedCapex(null)} className="px-5 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={submitting} className="bg-blue-700 text-white px-7 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50">
                                    {submitting ? 'Creating…' : 'Create Purchase Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── PURCHASE ORDERS TABLE ── */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
                        <h3 className="text-sm font-semibold text-gray-800">All Purchase Orders</h3>
                        <input
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); doSearch(e.target.value); }}
                            placeholder="Search PO#, vendor, CAPEX ref…"
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-64 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none ml-2"
                        />
                        <span className="text-xs text-gray-400 ml-auto">{orders.total} total</span>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-4 py-3">PO #</th>
                                <th className="px-4 py-3">CAPEX Ref</th>
                                <th className="px-4 py-3">Vendor</th>
                                <th className="px-4 py-3">Department</th>
                                <th className="px-4 py-3">Items</th>
                                <th className="px-4 py-3">VAT</th>
                                <th className="px-4 py-3">Total</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3 text-right">PDF</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.data.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="px-4 py-10 text-center text-gray-400">
                                        No purchase orders found.
                                    </td>
                                </tr>
                            )}
                            {orders.data.map(o => (
                                <tr key={o.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-bold text-red-600 text-base">{o.po_number}</td>
                                    <td className="px-4 py-3 font-mono text-blue-700 text-xs">{o.capex_ref}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{o.vendor_name}</td>
                                    <td className="px-4 py-3 text-gray-600">{o.department}</td>
                                    <td className="px-4 py-3 text-gray-500">{o.items_count}</td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {parseFloat(o.vat_amount) > 0 ? `$${parseFloat(o.vat_amount).toLocaleString('en-US',{minimumFractionDigits:2})}` : '—'}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-900">
                                        ${parseFloat(o.total_amount).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{o.created_at}</td>
                                    <td className="px-4 py-3 text-right">
                                        <a href={route('purchase-orders.pdf', o.id)} target="_blank" className="text-blue-600 hover:text-blue-800 text-xs font-medium underline">
                                            Download PDF
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Pagination */}
                    {orders.last_page > 1 && (
                        <div className="flex justify-center items-center gap-1 px-4 py-3 border-t border-gray-100 flex-wrap">
                            {orders.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : link.url
                                                ? 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                                                : 'text-gray-300 cursor-not-allowed pointer-events-none'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
