import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Button, InlineNotification,
    Select, SelectItem, TextInput,
    Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
    TableToolbar, TableToolbarContent, TableToolbarSearch,
    Pagination,
} from '@carbon/react';
import { DocumentDownload, Add, TrashCan } from '@carbon/icons-react';

export default function PurchaseOrders({ auth, orders, approvedCapex, nextPoNumber, filters = {}, flash, vendors = [] }) {
    const [selectedCapex, setSelectedCapex] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [search, setSearch] = useState(filters.search ?? '');

    const doSearch = (q) => {
        setSearch(q);
        router.get(route('purchase-orders.index'), { search: q }, {
            preserveState: true,
            replace: true,
            only: ['orders', 'filters'],
        });
    };

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

    const [items, setItems] = useState([
        { description: '', qty: 1, unit_price: '' },
    ]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const targetCapexId = params.get('capex_id');

        if (params.get('create') === '1' && approvedCapex?.length > 0 && !selectedCapex) {
            const targetedCapex = targetCapexId
                ? approvedCapex.find((capex) => String(capex.id) === String(targetCapexId))
                : null;

            selectCapex(targetedCapex ?? approvedCapex[0]);
            params.delete('create');
            params.delete('capex_id');
            const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
            window.history.replaceState({}, '', nextUrl);
        }
    }, [approvedCapex, selectedCapex]);

    const selectCapex = (capex) => {
        setSelectedCapex(capex);
        setForm(f => ({ ...f, requisition_no: capex.rtp_reference ?? '' }));
        if (capex.items?.length > 0) {
            setItems(capex.items.map(i => {
                const type = i.asset_type ?? i.description ?? '';
                const reqs = i.requirements ? ` — ${i.requirements}` : '';
                return { description: type + reqs, qty: i.quantity ?? 1, unit_price: i.unit_price ?? '' };
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

    const subtotal = items.reduce((sum, item) => {
        return sum + (parseFloat(item.qty) || 0) * (parseFloat(item.unit_price) || 0);
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

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Purchase Orders" />
            <div className="p-6 space-y-6">

                {flash?.success && <InlineNotification kind="success" title="Success" subtitle={flash.success} lowContrast onClose={() => {}} />}
                {flash?.error && <InlineNotification kind="error" title="Error" subtitle={flash.error} lowContrast onClose={() => {}} />}

                {/* Step 1: Choose CAPEX */}
                {approvedCapex?.length > 0 && !selectedCapex && (
                    <div className="bg-white border border-gray-200 p-5 shadow-sm">
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Generate New Purchase Order</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginBottom: '1rem' }}>Select an approved form to generate a PO from.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {approvedCapex.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => selectCapex(c)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--cds-border-subtle)', padding: '12px 16px', fontSize: '0.875rem', cursor: 'pointer', background: 'var(--cds-layer-02)', textAlign: 'left' }}
                                    className="transition-colors"
                                >
                                    <span>
                                        <span style={{ fontWeight: 700, color: 'var(--cds-link-primary)' }}>{c.rtp_reference}</span>
                                        <span style={{ marginLeft: '0.75rem', color: 'var(--cds-text-secondary)' }}>{c.department}</span>
                                        <span style={{ marginLeft: '0.75rem', color: 'var(--cds-text-placeholder)' }}>— {c.requested_by}</span>
                                    </span>
                                    <span style={{ fontWeight: 700, color: 'var(--cds-support-success)' }}>
                                        {c.total_amount ? `$${parseFloat(c.total_amount).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })}` : ''}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: PO Form */}
                {selectedCapex && (
                    <div className="bg-white border border-gray-200 p-5 shadow-sm">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                                    Purchase Order <span style={{ color: 'var(--cds-support-error)', fontWeight: 700, fontSize: '1.25rem' }}>#{nextPoNumber}</span>
                                </h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-placeholder)' }}>CAPEX: {selectedCapex.rtp_reference} — {selectedCapex.department}</p>
                            </div>
                            <Button kind="ghost" size="sm" onClick={() => setSelectedCapex(null)}>← Change CAPEX</Button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Vendor Details */}
                            <fieldset style={{ border: '1px solid var(--cds-border-subtle)', padding: '1rem' }}>
                                <legend style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', padding: '0 0.5rem' }}>Vendor Details</legend>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <Select
                                            id="po-vendor"
                                            labelText="Vendor / Supplier Name *"
                                            value={form.vendor_name}
                                            onChange={e => {
                                                const selected = vendors.find(v => v.name === e.target.value);
                                                setForm(f => ({ ...f, vendor_name: e.target.value, vendor_email: selected?.contact_email ?? f.vendor_email }));
                                            }}
                                            invalid={!!formErrors.vendor_name}
                                            invalidText={formErrors.vendor_name}
                                            required
                                        >
                                            <SelectItem value="" text="Select a vendor…" />
                                            {vendors.map(v => <SelectItem key={v.id} value={v.name} text={v.name} />)}
                                        </Select>
                                    </div>
                                    <TextInput id="po-email" labelText="Vendor Email" type="email" value={form.vendor_email} onChange={e => setForm(f => ({...f, vendor_email: e.target.value}))} placeholder="auto-filled or enter manually" />
                                    <TextInput id="po-tin" labelText="TIN" value={form.vendor_tin} onChange={e => setForm(f => ({...f, vendor_tin: e.target.value}))} placeholder="e.g. 2000231759" />
                                    <TextInput id="po-vat" labelText="VAT Number" value={form.vendor_vat_number} onChange={e => setForm(f => ({...f, vendor_vat_number: e.target.value}))} placeholder="e.g. 220006604" />
                                    <TextInput id="po-req" labelText="Requisition No." value={form.requisition_no} onChange={e => setForm(f => ({...f, requisition_no: e.target.value}))} />
                                </div>
                            </fieldset>

                            {/* Items */}
                            <fieldset style={{ border: '1px solid var(--cds-border-subtle)', padding: '1rem' }}>
                                <legend style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', padding: '0 0.5rem' }}>Goods / Services</legend>
                                <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
                                    <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--cds-layer-01)', color: 'var(--cds-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                <th style={{ border: '1px solid var(--cds-border-subtle)', padding: '8px', textAlign: 'center', width: '4rem' }}>Qty</th>
                                                <th style={{ border: '1px solid var(--cds-border-subtle)', padding: '8px', textAlign: 'left' }}>Description</th>
                                                <th style={{ border: '1px solid var(--cds-border-subtle)', padding: '8px', textAlign: 'right', width: '8rem' }}>Unit Price ($)</th>
                                                <th style={{ border: '1px solid var(--cds-border-subtle)', padding: '8px', textAlign: 'right', width: '8rem' }}>Total Cost</th>
                                                <th style={{ border: '1px solid var(--cds-border-subtle)', padding: '8px', width: '2.5rem' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, i) => {
                                                const rowTotal = (parseFloat(item.qty)||0) * (parseFloat(item.unit_price)||0);
                                                return (
                                                    <tr key={i}>
                                                        <td style={{ border: '1px solid var(--cds-border-subtle)', padding: '4px 8px' }}>
                                                            <input type="number" min="1" value={item.qty} onChange={e => updateItem(i,'qty',e.target.value)} style={{ width: '100%', textAlign: 'center', border: 0, fontSize: '0.875rem', outline: 'none' }} />
                                                        </td>
                                                        <td style={{ border: '1px solid var(--cds-border-subtle)', padding: '4px 8px' }}>
                                                            <input type="text" value={item.description} onChange={e => updateItem(i,'description',e.target.value)} style={{ width: '100%', border: 0, fontSize: '0.875rem', outline: 'none' }} placeholder="Description…" required />
                                                        </td>
                                                        <td style={{ border: '1px solid var(--cds-border-subtle)', padding: '4px 8px' }}>
                                                            <input type="number" step="0.01" min="0" value={item.unit_price} onChange={e => updateItem(i,'unit_price',e.target.value)} style={{ width: '100%', textAlign: 'right', border: 0, fontSize: '0.875rem', outline: 'none' }} placeholder="0.00" />
                                                        </td>
                                                        <td style={{ border: '1px solid var(--cds-border-subtle)', padding: '4px 12px', textAlign: 'right', fontWeight: 500, color: 'var(--cds-text-secondary)' }}>
                                                            {rowTotal > 0 ? `$${rowTotal.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}` : '—'}
                                                        </td>
                                                        <td style={{ border: '1px solid var(--cds-border-subtle)', padding: '4px', textAlign: 'center' }}>
                                                            {items.length > 1 && (
                                                                <Button kind="ghost" size="sm" renderIcon={TrashCan} iconDescription="Remove" onClick={() => removeItem(i)} hasIconOnly />
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="3" style={{ border: '1px solid var(--cds-border-subtle)', padding: '4px 12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', background: 'var(--cds-layer-01)' }}>VAT</td>
                                                <td style={{ border: '1px solid var(--cds-border-subtle)', padding: '4px 8px' }}>
                                                    <input type="number" step="0.01" min="0" value={form.vat_amount} onChange={e => setForm(f=>({...f,vat_amount:e.target.value}))} style={{ width: '100%', textAlign: 'right', border: 0, fontSize: '0.875rem', outline: 'none' }} placeholder="0.00" />
                                                </td>
                                                <td style={{ border: '1px solid var(--cds-border-subtle)' }}></td>
                                            </tr>
                                            <tr style={{ background: 'var(--cds-layer-01)' }}>
                                                <td colSpan="3" style={{ border: '1px solid var(--cds-border-subtle)', padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--cds-text-primary)' }}>TOTAL</td>
                                                <td style={{ border: '1px solid var(--cds-border-subtle)', padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--cds-text-primary)' }}>
                                                    ${total.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
                                                </td>
                                                <td style={{ border: '1px solid var(--cds-border-subtle)' }}></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <Button kind="ghost" size="sm" renderIcon={Add} onClick={addItem} style={{ marginTop: '0.5rem' }}>Add line item</Button>
                            </fieldset>

                            {/* Authorisation */}
                            <fieldset style={{ border: '1px solid var(--cds-border-subtle)', padding: '1rem' }}>
                                <legend style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', padding: '0 0.5rem' }}>Authorisation</legend>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                                    <TextInput id="po-manager" labelText="Manager" value={form.manager_name} onChange={e => setForm(f=>({...f,manager_name:e.target.value}))} placeholder="Manager name" />
                                    <TextInput id="po-alloc" labelText="Allocation" value={form.allocation} onChange={e => setForm(f=>({...f,allocation:e.target.value}))} placeholder="Cost centre / allocation" />
                                    <TextInput id="po-auth" labelText="Authorised By" value={form.authorised_by} onChange={e => setForm(f=>({...f,authorised_by:e.target.value}))} placeholder="Authorising officer" />
                                </div>
                            </fieldset>

                            {/* Payment Officer */}
                            <fieldset style={{ border: '1px solid var(--cds-support-warning)', padding: '1rem', background: 'var(--cds-layer-01)' }}>
                                <legend style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-support-warning)', textTransform: 'uppercase', padding: '0 0.5rem' }}>Payment Officer</legend>
                                <p style={{ fontSize: '0.75rem', color: 'var(--cds-support-warning)', marginBottom: '0.75rem' }}>
                                    This person will receive an email instructing them to process the payment to the vendor and notify the vendor to proceed with delivery.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <TextInput id="po-pay-name" labelText="Payment Officer Name" value={form.payment_person_name} onChange={e => setForm(f=>({...f,payment_person_name:e.target.value}))} placeholder="e.g. John Doe" invalid={!!formErrors.payment_person_name} invalidText={formErrors.payment_person_name} />
                                    <TextInput id="po-pay-email" labelText="Payment Officer Email" type="email" value={form.payment_person_email} onChange={e => setForm(f=>({...f,payment_person_email:e.target.value}))} placeholder="finance@company.co.zw" invalid={!!formErrors.payment_person_email} invalidText={formErrors.payment_person_email} />
                                </div>
                            </fieldset>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <Button kind="secondary" onClick={() => setSelectedCapex(null)}>Cancel</Button>
                                <Button kind="primary" type="submit" disabled={submitting}>
                                    {submitting ? 'Creating…' : 'Create Purchase Order'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* PO Table */}
                <div>
                    <TableToolbar>
                        <TableToolbarContent>
                            <TableToolbarSearch
                                value={search}
                                onChange={e => doSearch(e.target.value)}
                                placeholder="Search PO#, vendor, CAPEX ref…"
                                persistent
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-placeholder)', margin: 'auto 1rem auto auto' }}>{orders.total} total</span>
                        </TableToolbarContent>
                    </TableToolbar>

                    <Table size="lg" useZebraStyles>
                        <TableHead>
                            <TableRow>
                                <TableHeader>PO #</TableHeader>
                                <TableHeader>CAPEX Ref</TableHeader>
                                <TableHeader>Vendor</TableHeader>
                                <TableHeader>Department</TableHeader>
                                <TableHeader>Items</TableHeader>
                                <TableHeader>VAT</TableHeader>
                                <TableHeader>Total</TableHeader>
                                <TableHeader>Date</TableHeader>
                                <TableHeader>PDF</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} style={{ textAlign: 'center', color: 'var(--cds-text-placeholder)' }}>No purchase orders found.</TableCell>
                                </TableRow>
                            )}
                            {orders.data.map(o => (
                                <TableRow key={o.id}>
                                    <TableCell><strong style={{ color: 'var(--cds-support-error)', fontSize: '1rem' }}>{o.po_number}</strong></TableCell>
                                    <TableCell><code style={{ color: 'var(--cds-link-primary)', fontSize: '0.75rem' }}>{o.capex_ref}</code></TableCell>
                                    <TableCell><strong>{o.vendor_name}</strong></TableCell>
                                    <TableCell>{o.department}</TableCell>
                                    <TableCell>{o.items_count}</TableCell>
                                    <TableCell>{parseFloat(o.vat_amount) > 0 ? `$${parseFloat(o.vat_amount).toLocaleString('en-US',{minimumFractionDigits:2})}` : '—'}</TableCell>
                                    <TableCell><strong>${parseFloat(o.total_amount).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></TableCell>
                                    <TableCell>{o.created_at}</TableCell>
                                    <TableCell>
                                        <Button kind="ghost" size="sm" renderIcon={DocumentDownload} as="a" href={route('purchase-orders.pdf', o.id)} target="_blank">
                                            PDF
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {orders.last_page > 1 && (
                        <Pagination
                            totalItems={orders.total}
                            pageSize={orders.per_page}
                            page={orders.current_page}
                            pageSizes={[15, 25, 50]}
                            onChange={({ page }) => router.get(route('purchase-orders.index'), { page, search })}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
