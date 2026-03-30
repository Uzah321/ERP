import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Button, InlineNotification, Tag,
    Modal, TextInput, TextArea,
    Select, SelectItem,
    Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
    TableToolbar, TableToolbarContent, TableToolbarSearch,
    Pagination,
} from '@carbon/react';
import { DocumentAdd } from '@carbon/icons-react';

const statusTagType = (s) => {
    if (s === 'complete') return 'green';
    if (s === 'partial') return 'yellow';
    if (s === 'delivered') return 'blue';
    return 'gray';
};

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

    return (
        <AuthenticatedLayout>
            <Head title="Goods Receipts" />
            <div className="p-6 space-y-6">

                {flash?.success && (
                    <InlineNotification kind="success" title="Success" subtitle={flash.success} lowContrast onClose={() => {}} />
                )}

                {/* Pending POs */}
                <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>Open Purchase Orders Awaiting Delivery</h2>
                    {pendingPos.length === 0 ? (
                        <p style={{ color: 'var(--cds-text-placeholder)', fontStyle: 'italic', fontSize: '0.875rem' }}>All purchase orders have been fully delivered.</p>
                    ) : (
                        <Table size="lg" useZebraStyles>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>PO #</TableHeader>
                                    <TableHeader>CAPEX Ref</TableHeader>
                                    <TableHeader>Vendor</TableHeader>
                                    <TableHeader>Total (USD)</TableHeader>
                                    <TableHeader>Delivery Status</TableHeader>
                                    <TableHeader>Action</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingPos.map(po => (
                                    <TableRow key={po.id}>
                                        <TableCell><code><strong>{po.po_number}</strong></code></TableCell>
                                        <TableCell>{po.rtp_reference}</TableCell>
                                        <TableCell>{po.vendor_name}</TableCell>
                                        <TableCell><strong>${Number(po.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></TableCell>
                                        <TableCell>
                                            <Tag type={statusTagType(po.delivery_status)} size="sm">{po.delivery_status}</Tag>
                                        </TableCell>
                                        <TableCell>
                                            <Button kind="primary" size="sm" renderIcon={DocumentAdd} onClick={() => selectPo(po)}>
                                                Record Receipt
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Receipt Form Modal */}
                <Modal
                    open={!!selectedPo}
                    modalHeading={selectedPo ? `Record Delivery — PO #${selectedPo.po_number} · ${selectedPo.vendor_name}` : ''}
                    primaryButtonText="Save Receipt"
                    secondaryButtonText="Cancel"
                    onRequestClose={() => setSelectedPo(null)}
                    onRequestSubmit={submit}
                    size="lg"
                >
                    {selectedPo && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <TextInput id="gr-date" labelText="Date Received *" type="date" value={form.received_at} onChange={e => setForm(f => ({ ...f, received_at: e.target.value }))} required />
                                <TextInput id="gr-dn" labelText="Delivery Note No." placeholder="e.g. DN-20260324-001" value={form.delivery_note_no} onChange={e => setForm(f => ({ ...f, delivery_note_no: e.target.value }))} />
                                <Select id="gr-status" labelText="Receipt Status *" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} required>
                                    <SelectItem value="complete" text="Complete Delivery" />
                                    <SelectItem value="partial" text="Partial Delivery" />
                                </Select>
                            </div>

                            {/* Items */}
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', marginBottom: '0.5rem' }}>Items Received</p>
                                <Table size="sm">
                                    <TableHead>
                                        <TableRow>
                                            <TableHeader>Description</TableHeader>
                                            <TableHeader>Qty Ordered</TableHeader>
                                            <TableHeader>Qty Received</TableHeader>
                                            <TableHeader>Unit Price (USD)</TableHeader>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {form.items.map((it, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{it.description}</TableCell>
                                                <TableCell>{it.qty_ordered}</TableCell>
                                                <TableCell>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={it.qty_ordered}
                                                        value={it.qty_received}
                                                        onChange={e => setItemQty(idx, e.target.value)}
                                                        style={{ width: '5rem', border: '1px solid var(--cds-border-subtle)', padding: '2px 6px', textAlign: 'center', fontSize: '0.875rem' }}
                                                    />
                                                </TableCell>
                                                <TableCell>${Number(it.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <TextArea id="gr-condition" labelText="Condition Notes" rows={2} placeholder="e.g. packaging damaged, item in good condition..." value={form.condition_notes} onChange={e => setForm(f => ({ ...f, condition_notes: e.target.value }))} />
                                <TextArea id="gr-notes" labelText="Additional Notes" rows={2} placeholder="Any other notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                            </div>

                            {form.status === 'complete' && (
                                <InlineNotification
                                    kind="info"
                                    title="Auto-create assets:"
                                    subtitle="On complete delivery, one asset record will be created per unit received and linked to the relevant department."
                                    lowContrast
                                    onClose={() => {}}
                                />
                            )}
                        </div>
                    )}
                </Modal>

                {/* Receipt History */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Receipt History</h2>
                    </div>
                    <TableToolbar>
                        <TableToolbarContent>
                            <TableToolbarSearch
                                value={search}
                                onChange={e => doSearch(e.target.value)}
                                placeholder="Search vendor or CAPEX ref…"
                                persistent
                            />
                        </TableToolbarContent>
                    </TableToolbar>

                    {receipts.data.length === 0 ? (
                        <p style={{ color: 'var(--cds-text-placeholder)', fontStyle: 'italic', fontSize: '0.875rem' }}>No receipts recorded yet.</p>
                    ) : (
                        <>
                            <Table size="lg" useZebraStyles>
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>PO #</TableHeader>
                                        <TableHeader>CAPEX Ref</TableHeader>
                                        <TableHeader>Vendor</TableHeader>
                                        <TableHeader>Received Date</TableHeader>
                                        <TableHeader>Delivery Note</TableHeader>
                                        <TableHeader>Status</TableHeader>
                                        <TableHeader>Received By</TableHeader>
                                        <TableHeader>Conditions</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {receipts.data.map(r => (
                                        <TableRow key={r.id}>
                                            <TableCell><code><strong>{r.po_number}</strong></code></TableCell>
                                            <TableCell>{r.rtp_reference}</TableCell>
                                            <TableCell>{r.vendor_name}</TableCell>
                                            <TableCell>{r.received_at}</TableCell>
                                            <TableCell>{r.delivery_note_no || '—'}</TableCell>
                                            <TableCell>
                                                <Tag type={statusTagType(r.status)} size="sm">{r.status}</Tag>
                                            </TableCell>
                                            <TableCell>{r.received_by_name}</TableCell>
                                            <TableCell>
                                                <span style={{ maxWidth: '12rem', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                                                    {r.condition_notes || '—'}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {receipts.last_page > 1 && (
                                <Pagination
                                    totalItems={receipts.total}
                                    pageSize={receipts.per_page}
                                    page={receipts.current_page}
                                    pageSizes={[15, 25, 50]}
                                    onChange={({ page }) => router.get(route('goods-receipts.index'), { page, search })}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
