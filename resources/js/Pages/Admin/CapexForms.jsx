import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Button, InlineNotification, Tag,
    Select, SelectItem, TextInput, TextArea, Checkbox,
    Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
    TableToolbar, TableToolbarContent, TableToolbarSearch,
    Pagination,
} from '@carbon/react';
import { DocumentDownload, Add, TrashCan } from '@carbon/icons-react';

const getStatusTag = (f) => {
    if (f.status === 'approved') return { label: 'Fully Approved', type: 'green' };
    if (f.status === 'declined') return { label: 'Declined', type: 'red' };
    return { label: f.current_stage_label || 'Pending', type: 'blue' };
};

export default function CapexForms({ auth, forms, assetRequests, users = [], filters = {}, flash }) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['forms', 'assetRequests'], preserveScroll: true, preserveState: true });
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const [quotationFiles, setQuotationFiles] = useState([null, null, null]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [editableItems, setEditableItems] = useState([]);
    const [search, setSearch]           = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');

    const [approvalChain, setApprovalChain] = useState([
        { user_id: '', label: 'IT Manager' },
    ]);

    const doSearch = (q, status) => {
        router.get(route('admin.capex.index'), { search: q, status }, {
            preserveState: true,
            replace: true,
            only: ['forms', 'filters'],
        });
    };

    const updateChainItem = (index, field, value) => {
        setApprovalChain(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const addChainStage = () => {
        setApprovalChain(prev => [...prev, { user_id: '', label: '' }]);
    };

    const updateItemPrice = (index, price) => {
        setEditableItems(prev => {
            const updated = prev.map((item, i) =>
                i === index ? { ...item, unit_price: price } : item
            );
            const newTotal = updated.reduce(
                (s, it) => s + parseFloat(it.unit_price || 0) * (parseInt(it.quantity ?? 1, 10)), 0
            );
            setData(d => ({ ...d, total_amount: newTotal > 0 ? newTotal.toFixed(2) : d.total_amount }));
            return updated;
        });
    };

    const removeChainStage = (index) => {
        if (approvalChain.length <= 1) return;
        setApprovalChain(prev => prev.filter((_, i) => i !== index));
    };

    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const { data, setData, reset } = useForm({
        asset_request_id:    '',
        request_type:        'New Employee Onboarding',
        asset_life:          '4 Years',
        cost_allocation:     '',
        insurance_status:    true,
        reason_for_purchase: '',
        total_amount:        '',
    });

    const addQuotationSlot = () => {
        setQuotationFiles(prev => [...prev, null]);
    };

    const handleQuotationChange = (index, file) => {
        setQuotationFiles(prev => {
            const updated = [...prev];
            updated[index] = file;
            return updated;
        });
        setData(d => ({
            ...d,
            quotations: quotationFiles
                .map((f, i) => i === index ? file : f)
                .filter(Boolean),
        }));
    };

    const handleCreate = (e) => {
        e.preventDefault();
        const filled = quotationFiles.filter(Boolean);
        if (filled.length < 3) {
            alert('Please upload at least 3 vendor quotations before submitting.');
            return;
        }
        if (approvalChain.some(s => !s.user_id || !s.label.trim())) {
            alert('Please fill in every stage in the Approval Chain (select a user and enter a role label).');
            return;
        }
        const fd = new FormData();
        fd.append('asset_request_id', data.asset_request_id);
        fd.append('request_type', data.request_type);
        fd.append('asset_life', data.asset_life);
        fd.append('cost_allocation', data.cost_allocation);
        fd.append('insurance_status', data.insurance_status ? '1' : '0');
        fd.append('reason_for_purchase', data.reason_for_purchase);
        fd.append('total_amount', data.total_amount);
        filled.forEach(file => fd.append('quotations[]', file));
        fd.append('approval_chain', JSON.stringify(approvalChain));
        if (editableItems.length > 0) {
            fd.append('items', JSON.stringify(editableItems));
        }
        setSubmitting(true);
        setFormErrors({});
        router.post(route('capex.store'), fd, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setQuotationFiles([null, null, null]);
                setApprovalChain([{ user_id: '', label: 'IT Manager' }]);
                setEditableItems([]);
                setSelectedRequest(null);
                setFormErrors({});
            },
            onError: (errs) => setFormErrors(errs),
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Approval Forms" />
            <div className="p-6 space-y-6">

                {flash?.success && <InlineNotification kind="success" title="Success" subtitle={flash.success} lowContrast onClose={() => {}} />}
                {flash?.error && <InlineNotification kind="error" title="Error" subtitle={flash.error} lowContrast onClose={() => {}} />}

                {/* Create Approval Form */}
                {assetRequests?.length > 0 && (
                    <div className="bg-white border border-gray-200 p-5 shadow-sm">
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Create New Approval Form</h3>
                        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <Select
                                    id="capex-request"
                                    labelText="Asset Request *"
                                    value={data.asset_request_id}
                                    onChange={e => {
                                        const req = assetRequests.find(r => String(r.id) === String(e.target.value)) ?? null;
                                        setSelectedRequest(req);
                                        const items = (req?.items ?? []).map(i => ({ ...i, unit_price: i.unit_price ?? '' }));
                                        setEditableItems(items);
                                        const computedTotal = items.reduce((sum, i) =>
                                            sum + (parseFloat(i.unit_price || 0) * (parseInt(i.quantity ?? 1, 10))), 0);
                                        setData(d => ({
                                            ...d,
                                            asset_request_id: e.target.value,
                                            total_amount: computedTotal > 0 ? computedTotal.toFixed(2) : '',
                                        }));
                                    }}
                                    invalid={!!formErrors.asset_request_id}
                                    invalidText={formErrors.asset_request_id}
                                    required
                                >
                                    <SelectItem value="" text="Select an approved asset request…" />
                                    {assetRequests.map(r => (
                                        <SelectItem key={r.id} value={r.id} text={`SRQ-${new Date().getFullYear()}-${String(r.id).padStart(4,'0')} — ${r.asset_type} (${r.department_name})`} />
                                    ))}
                                </Select>

                                {/* Editable items table */}
                                {editableItems.length > 0 && (() => {
                                    const computedTotal = editableItems.reduce(
                                        (s, i) => s + parseFloat(i.unit_price || 0) * (parseInt(i.quantity ?? 1, 10)), 0
                                    );
                                    return (
                                        <div style={{ marginTop: '0.75rem', border: '1px solid var(--cds-border-subtle)', overflow: 'hidden' }}>
                                            <div style={{ background: 'var(--cds-layer-01)', padding: '8px 12px', borderBottom: '1px solid var(--cds-border-subtle)', fontSize: '0.75rem', color: 'var(--cds-link-primary)', fontWeight: 500 }}>
                                                Enter the unit price for each item — the total will be calculated automatically.
                                            </div>
                                            <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                                                <thead style={{ background: 'var(--cds-interactive)', color: 'var(--cds-text-inverse)' }}>
                                                    <tr>
                                                        <th style={{ padding: '6px 12px', textAlign: 'left' }}>Item</th>
                                                        <th style={{ padding: '6px 12px', textAlign: 'center', width: '3rem' }}>Qty</th>
                                                        <th style={{ padding: '6px 12px', textAlign: 'right', width: '8rem' }}>Unit Price ($) *</th>
                                                        <th style={{ padding: '6px 12px', textAlign: 'right', width: '7rem' }}>Line Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {editableItems.map((item, i) => {
                                                        const qty = parseInt(item.quantity ?? 1, 10);
                                                        const up = parseFloat(item.unit_price || 0);
                                                        const lineTotal = qty * up;
                                                        return (
                                                            <tr key={i} style={{ background: i % 2 === 0 ? 'var(--cds-layer-02)' : 'var(--cds-layer-01)' }}>
                                                                <td style={{ padding: '8px 12px', fontWeight: 500 }}>
                                                                    {item.asset_type ?? item.description ?? '—'}
                                                                    {item.requirements && <div style={{ color: 'var(--cds-text-placeholder)', fontWeight: 400 }}>{item.requirements}</div>}
                                                                </td>
                                                                <td style={{ padding: '8px 12px', textAlign: 'center' }}>{qty}</td>
                                                                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0"
                                                                        value={item.unit_price ?? ''}
                                                                        onChange={e => updateItemPrice(i, e.target.value)}
                                                                        style={{ width: '7rem', border: '1px solid var(--cds-border-subtle)', padding: '2px 6px', textAlign: 'right', fontSize: '0.75rem', outline: 'none' }}
                                                                        placeholder="0.00"
                                                                        required
                                                                    />
                                                                </td>
                                                                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                                                                    {lineTotal > 0 ? `$${lineTotal.toFixed(2)}` : <span style={{ color: 'var(--cds-text-placeholder)' }}>—</span>}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                                <tfoot>
                                                    <tr style={{ background: 'var(--cds-interactive)', color: 'var(--cds-text-inverse)' }}>
                                                        <td colSpan="3" style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Total Order Amount</td>
                                                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>
                                                            {computedTotal > 0 ? `$${computedTotal.toFixed(2)}` : '—'}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    );
                                })()}
                            </div>

                            <TextInput id="capex-type" labelText="Request Type *" value={data.request_type} onChange={e => setData('request_type', e.target.value)} required />
                            <TextInput id="capex-life" labelText="Asset Life *" value={data.asset_life} onChange={e => setData('asset_life', e.target.value)} placeholder="e.g. 4 Years" required />
                            <TextInput id="capex-alloc" labelText="Department / Cost Allocation" value={data.cost_allocation} onChange={e => setData('cost_allocation', e.target.value)} placeholder="e.g. Central Kitchen Bulawayo" />

                            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                                <Checkbox
                                    id="capex-insurance"
                                    labelText="Insurance Status — Yes"
                                    checked={data.insurance_status}
                                    onChange={(_, { checked }) => setData('insurance_status', checked)}
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <TextArea id="capex-reason" labelText="Reason for Asset Purchase" value={data.reason_for_purchase} onChange={e => setData('reason_for_purchase', e.target.value)} rows={3} placeholder="Describe why these assets are needed…" />
                            </div>

                            {/* Approval Chain */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                        Approval Chain <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-placeholder)', fontWeight: 400 }}>Who approves this form, in order</span>
                                    </label>
                                    <Button kind="ghost" size="sm" renderIcon={Add} onClick={addChainStage}>Add Stage</Button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {approvalChain.map((stage, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', width: '4rem', flexShrink: 0 }}>Stage {i + 1}</span>
                                            <Select id={`chain-user-${i}`} labelText="" hideLabel value={stage.user_id} onChange={e => updateChainItem(i, 'user_id', e.target.value)} required style={{ flex: 1 }}>
                                                <SelectItem value="" text="Select approver…" />
                                                {users.map(u => <SelectItem key={u.id} value={u.id} text={u.name} />)}
                                            </Select>
                                            <TextInput id={`chain-label-${i}`} labelText="" hideLabel value={stage.label} onChange={e => updateChainItem(i, 'label', e.target.value)} placeholder="Role label (e.g. IT Manager)" required style={{ flex: 1 }} />
                                            {approvalChain.length > 1 && (
                                                <Button kind="ghost" size="sm" renderIcon={TrashCan} iconDescription="Remove stage" onClick={() => removeChainStage(i)} hasIconOnly />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {formErrors.approval_chain && <p style={{ color: 'var(--cds-support-error)', fontSize: '0.75rem', marginTop: '4px' }}>{formErrors.approval_chain}</p>}
                            </div>

                            {/* Quotations */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                        Vendor Quotations <span style={{ color: 'var(--cds-support-error)' }}>*</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-placeholder)', fontWeight: 400, marginLeft: '0.5rem' }}>minimum 3 required (PDF, Word, or image)</span>
                                    </label>
                                    <Button kind="ghost" size="sm" renderIcon={Add} onClick={addQuotationSlot}>Add another</Button>
                                </div>
                                <InlineNotification
                                    kind="success"
                                    title="Quotation 1"
                                    subtitle="must be the cheapest / recommended quote — it will be marked as the selected quotation on the approval PDF."
                                    lowContrast
                                    onClose={() => {}}
                                    style={{ marginBottom: '0.5rem' }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {quotationFiles.map((file, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', width: '6rem', flexShrink: 0 }}>Quotation {i + 1}{i < 3 ? ' *' : ''}</span>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                onChange={e => handleQuotationChange(i, e.target.files[0] || null)}
                                                style={{ flex: 1, fontSize: '0.75rem', border: '1px solid var(--cds-border-subtle)', padding: '6px 8px' }}
                                                required={i < 3}
                                            />
                                            {file && <span style={{ fontSize: '0.75rem', color: 'var(--cds-support-success)', flexShrink: 0 }}>✓ {file.name}</span>}
                                        </div>
                                    ))}
                                </div>
                                {formErrors.quotations && <p style={{ color: 'var(--cds-support-error)', fontSize: '0.75rem', marginTop: '4px' }}>{formErrors.quotations}</p>}
                                {[...Array(quotationFiles.length)].map((_, i) =>
                                    formErrors[`quotations.${i}`] ? (
                                        <p key={i} style={{ color: 'var(--cds-support-error)', fontSize: '0.75rem', marginTop: '2px' }}>Quotation {i + 1}: {formErrors[`quotations.${i}`]}</p>
                                    ) : null
                                )}
                            </div>

                            {/* Total */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>
                                    Total Order Amount <span style={{ color: 'var(--cds-support-error)' }}>*</span>
                                    {editableItems.length > 0 && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--cds-link-primary)', fontWeight: 400, marginLeft: '0.5rem' }}>auto-calculated from item prices above — adjust if quotation differs</span>
                                    )}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cds-text-secondary)', fontWeight: 500 }}>$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.total_amount}
                                        onChange={e => setData('total_amount', e.target.value)}
                                        style={{ width: '100%', border: '1px solid var(--cds-border-subtle)', paddingLeft: '28px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', fontSize: '0.875rem', outline: 'none' }}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                {formErrors.total_amount && <p style={{ color: 'var(--cds-support-error)', fontSize: '0.75rem', marginTop: '4px' }}>{formErrors.total_amount}</p>}
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                                <Button kind="primary" type="submit" disabled={submitting}>
                                    {submitting ? 'Creating…' : 'Create & Send for Approval'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* CAPEX Table */}
                <div>
                    <TableToolbar>
                        <TableToolbarContent>
                            <TableToolbarSearch
                                value={search}
                                onChange={e => { setSearch(e.target.value); doSearch(e.target.value, statusFilter); }}
                                placeholder="Search reference, department, requester…"
                                persistent
                            />
                            <Select
                                id="capex-status-filter"
                                labelText=""
                                hideLabel
                                value={statusFilter}
                                onChange={e => { setStatusFilter(e.target.value); doSearch(search, e.target.value); }}
                                style={{ minWidth: '160px' }}
                            >
                                <SelectItem value="" text="All Statuses" />
                                <SelectItem value="pending" text="Pending" />
                                <SelectItem value="approved" text="Approved" />
                                <SelectItem value="declined" text="Declined" />
                            </Select>
                            <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-placeholder)', margin: 'auto 1rem auto auto' }}>{forms.total} total</span>
                        </TableToolbarContent>
                    </TableToolbar>

                    <Table size="lg" useZebraStyles>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Reference</TableHeader>
                                <TableHeader>Department</TableHeader>
                                <TableHeader>Requested By</TableHeader>
                                <TableHeader>Type</TableHeader>
                                <TableHeader>Items</TableHeader>
                                <TableHeader>Order Total</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader>Date</TableHeader>
                                <TableHeader>PDF</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {forms.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} style={{ textAlign: 'center', color: 'var(--cds-text-placeholder)' }}>No approval forms found.</TableCell>
                                </TableRow>
                            )}
                            {forms.data.map(f => {
                                const { label, type } = getStatusTag(f);
                                return (
                                    <TableRow key={f.id}>
                                        <TableCell><code style={{ color: 'var(--cds-link-primary)', fontWeight: 500 }}>{f.rtp_reference}</code></TableCell>
                                        <TableCell>{f.department}</TableCell>
                                        <TableCell>{f.requested_by}</TableCell>
                                        <TableCell>{f.request_type}</TableCell>
                                        <TableCell>{f.items_count}</TableCell>
                                        <TableCell><strong>{f.total_amount ? `$${parseFloat(f.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}</strong></TableCell>
                                        <TableCell><Tag type={type} size="sm">{label}</Tag></TableCell>
                                        <TableCell>{f.created_at}</TableCell>
                                        <TableCell>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <Button kind="ghost" size="sm" renderIcon={DocumentDownload} as="a" href={route('capex.pdf', f.id)} target="_blank">PDF</Button>
                                                {f.status === 'approved' && (
                                                    <Button kind="ghost" size="sm" as="a" href={route('purchase-orders.index')}>Generate PO</Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {forms.last_page > 1 && (
                        <Pagination
                            totalItems={forms.total}
                            pageSize={forms.per_page}
                            page={forms.current_page}
                            pageSizes={[15, 25, 50]}
                            onChange={({ page }) => router.get(route('admin.capex.index'), { page, search, status: statusFilter })}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
