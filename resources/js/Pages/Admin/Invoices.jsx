import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Button, InlineNotification, Tag,
    Modal, TextInput, TextArea,
    Select, SelectItem,
    Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
    TableToolbar, TableToolbarContent, TableToolbarSearch,
    Pagination,
} from '@carbon/react';
import { Add, CheckmarkFilled } from '@carbon/icons-react';

const statusTagType = (s) => {
    if (s === 'paid') return 'green';
    if (s === 'pending') return 'blue';
    if (s === 'overdue') return 'red';
    return 'gray';
};

export default function Invoices({ invoices, uninvoicedPos, filters, flash }) {
    const [search, setSearch]           = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');
    const [showForm, setShowForm]       = useState(false);
    const [payModal, setPayModal]       = useState(null);
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

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const targetPoId = params.get('po_id');

        if (params.get('create') === '1' && uninvoicedPos.length > 0) {
            setShowForm(true);
            if (targetPoId) {
                selectPo(targetPoId);
            }
            params.delete('create');
            params.delete('po_id');
            const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
            window.history.replaceState({}, '', nextUrl);
        }
    }, [uninvoicedPos.length]);

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

    return (
        <AuthenticatedLayout>
            <Head title="Invoices & Payments" />
            <div className="p-6 space-y-4">

                {flash?.success && (
                    <InlineNotification kind="success" title="Success" subtitle={flash.success} lowContrast onClose={() => {}} />
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">{flash.error}</div>
                )}

                {uninvoicedPos.length > 0 && (
                    <InlineNotification
                        kind="warning"
                        title={`${uninvoicedPos.length} delivered PO${uninvoicedPos.length > 1 ? 's' : ''} awaiting invoice:`}
                        subtitle={uninvoicedPos.map(p => `PO #${p.po_number}`).join(', ')}
                        lowContrast
                        onClose={() => {}}
                    />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Invoices &amp; Payments</h1>
                    <Button renderIcon={Add} onClick={() => setShowForm(true)} kind="primary" size="sm">Record Invoice</Button>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <TableToolbar style={{ flex: 1 }}>
                        <TableToolbarContent>
                            <TableToolbarSearch
                                value={search}
                                onChange={e => doSearch(e.target.value, statusFilter)}
                                placeholder="Search invoice #, vendor or CAPEX ref…"
                                persistent
                            />
                        </TableToolbarContent>
                    </TableToolbar>
                    <Select
                        id="inv-status-filter"
                        labelText=""
                        hideLabel
                        value={statusFilter}
                        onChange={e => doSearch(search, e.target.value)}
                        style={{ minWidth: '160px' }}
                    >
                        <SelectItem value="" text="All Statuses" />
                        <SelectItem value="pending" text="Pending" />
                        <SelectItem value="paid" text="Paid" />
                        <SelectItem value="overdue" text="Overdue" />
                        <SelectItem value="disputed" text="Disputed" />
                    </Select>
                </div>

                {invoices.data.length === 0 ? (
                    <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.875rem' }}>No invoices recorded yet.</p>
                ) : (
                    <>
                        <Table size="lg" useZebraStyles>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Invoice #</TableHeader>
                                    <TableHeader>PO #</TableHeader>
                                    <TableHeader>Vendor</TableHeader>
                                    <TableHeader>CAPEX Ref</TableHeader>
                                    <TableHeader>Date</TableHeader>
                                    <TableHeader>Due</TableHeader>
                                    <TableHeader>Amount (USD)</TableHeader>
                                    <TableHeader>VAT (USD)</TableHeader>
                                    <TableHeader>PO Match</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Action</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {invoices.data.map(inv => (
                                    <TableRow key={inv.id}>
                                        <TableCell><code>{inv.invoice_number}</code></TableCell>
                                        <TableCell><code>{inv.po_number}</code></TableCell>
                                        <TableCell>{inv.vendor_name}</TableCell>
                                        <TableCell><small>{inv.rtp_reference}</small></TableCell>
                                        <TableCell>{inv.invoice_date}</TableCell>
                                        <TableCell>{inv.due_date || '—'}</TableCell>
                                        <TableCell><strong>${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></TableCell>
                                        <TableCell>${Number(inv.vat_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                        <TableCell>
                                            {inv.amount_mismatch
                                                ? <Tag type="red" size="sm">Mismatch</Tag>
                                                : <Tag type="green" size="sm">Match</Tag>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Tag type={statusTagType(inv.status)} size="sm">{inv.status}</Tag>
                                        </TableCell>
                                        <TableCell>
                                            {inv.status !== 'paid' ? (
                                                <Button
                                                    kind="primary"
                                                    size="sm"
                                                    renderIcon={CheckmarkFilled}
                                                    onClick={() => { setPayModal(inv); setPayForm({ paid_at: new Date().toISOString().slice(0, 10), payment_reference: '', payment_method: 'EFT' }); }}
                                                >
                                                    Mark Paid
                                                </Button>
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Paid {inv.paid_at} via {inv.payment_method}</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {invoices.last_page > 1 && (
                            <Pagination
                                totalItems={invoices.total}
                                pageSize={invoices.per_page}
                                page={invoices.current_page}
                                pageSizes={[15, 25, 50]}
                                onChange={({ page }) => router.get(route('invoices.index'), { page, search, status: statusFilter })}
                            />
                        )}
                    </>
                )}

                {/* Record Invoice Modal */}
                <Modal
                    open={showForm}
                    modalHeading="Record Invoice"
                    primaryButtonText="Save Invoice"
                    secondaryButtonText="Cancel"
                    onRequestClose={() => setShowForm(false)}
                    onRequestSubmit={submitInvoice}
                    size="lg"
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Select id="inv-po" labelText="Purchase Order *" autoFocus value={form.purchase_order_id} onChange={e => selectPo(e.target.value)} required>
                            <SelectItem value="" text="— Select PO —" />
                            {uninvoicedPos.map(p => (
                                <SelectItem key={p.id} value={p.id} text={`PO #${p.po_number} · ${p.vendor_name} · ${p.rtp_reference}`} />
                            ))}
                        </Select>
                        <TextInput id="inv-number" labelText="Invoice Number *" placeholder="e.g. INV-2026-0042" value={form.invoice_number} onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))} required />
                        <TextInput id="inv-date" labelText="Invoice Date *" type="date" value={form.invoice_date} onChange={e => setForm(f => ({ ...f, invoice_date: e.target.value }))} required />
                        <TextInput id="inv-due" labelText="Due Date" type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                        <TextInput id="inv-amount" labelText="Amount (excl. VAT, USD) *" type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                        <TextInput id="inv-vat" labelText="VAT Amount (USD)" type="number" step="0.01" min="0" value={form.vat_amount} onChange={e => setForm(f => ({ ...f, vat_amount: e.target.value }))} />
                        <div style={{ gridColumn: '1 / -1' }}>
                            <TextArea id="inv-notes" labelText="Notes" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                        </div>
                    </div>
                </Modal>

                {/* Mark Paid Modal */}
                <Modal
                    open={!!payModal}
                    modalHeading="Mark Invoice as Paid"
                    primaryButtonText="Confirm Payment"
                    secondaryButtonText="Cancel"
                    onRequestClose={() => setPayModal(null)}
                    onRequestSubmit={submitPayment}
                >
                    {payModal && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <p style={{ fontSize: '0.875rem' }}>Invoice <strong>{payModal.invoice_number}</strong> — ${Number(payModal.amount).toLocaleString()} + VAT</p>
                            <TextInput id="pay-date" labelText="Payment Date *" type="date" autoFocus value={payForm.paid_at} onChange={e => setPayForm(f => ({ ...f, paid_at: e.target.value }))} required />
                            <Select id="pay-method" labelText="Payment Method" value={payForm.payment_method} onChange={e => setPayForm(f => ({ ...f, payment_method: e.target.value }))}>
                                <SelectItem value="EFT" text="EFT" />
                                <SelectItem value="Cheque" text="Cheque" />
                                <SelectItem value="Cash" text="Cash" />
                                <SelectItem value="Card" text="Card" />
                            </Select>
                            <TextInput id="pay-ref" labelText="Payment Reference" placeholder="e.g. TRN-00123" value={payForm.payment_reference} onChange={e => setPayForm(f => ({ ...f, payment_reference: e.target.value }))} />
                        </div>
                    )}
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
