import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Button, InlineNotification, Tag,
    Modal, TextInput, TextArea,
    Select, SelectItem,
    Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
    TableToolbar, TableToolbarContent, TableToolbarSearch,
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/icons-react';

const EMPTY_FORM = {
    software_name: '', vendor_name: '', licence_key: '', licence_type: 'subscription',
    seat_count: '', seats_used: '', purchase_date: '', expiry_date: '',
    purchase_cost: '', annual_cost: '', status: 'active', notes: '',
};

const expiryTagType = (s) => {
    if (s === 'expired') return 'red';
    if (s === 'expiring_soon') return 'yellow';
    if (s === 'active') return 'green';
    return 'gray';
};

const expiryLabel = (s) => {
    if (s === 'expired') return 'Expired';
    if (s === 'expiring_soon') return 'Expiring Soon';
    if (s === 'active') return 'Active';
    return 'No Expiry';
};

const statusTagType = (s) => {
    if (s === 'active') return 'green';
    if (s === 'expired') return 'red';
    return 'gray';
};

export default function SoftwareLicences({ licences, filters, flash }) {
    const [search, setSearch]     = useState(filters?.search ?? '');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing]   = useState(null);
    const [form, setForm]         = useState(EMPTY_FORM);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);

    function openNew() { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }
    function openEdit(lic) {
        setEditing(lic);
        setForm({
            software_name: lic.software_name ?? '',
            vendor_name:   lic.vendor_name ?? '',
            licence_key:   '',
            licence_type:  lic.licence_type ?? 'subscription',
            seat_count:    lic.seat_count ?? '',
            seats_used:    lic.seats_used ?? '',
            purchase_date: lic.purchase_date ?? '',
            expiry_date:   lic.expiry_date ?? '',
            purchase_cost: lic.purchase_cost ?? '',
            annual_cost:   lic.annual_cost ?? '',
            status:        lic.status ?? 'active',
            notes:         lic.notes ?? '',
        });
        setShowForm(true);
    }

    function doSearch(q) {
        setSearch(q);
        router.get(route('admin.software-licences.index'), { search: q }, {
            only: ['licences', 'filters'], preserveState: true, replace: true,
        });
    }

    function submitForm(e) {
        e.preventDefault();
        if (editing) {
            router.put(route('admin.software-licences.update', editing.id), form, {
                onSuccess: () => { setShowForm(false); setEditing(null); },
            });
        } else {
            router.post(route('admin.software-licences.store'), form, {
                onSuccess: () => { setShowForm(false); setForm(EMPTY_FORM); },
            });
        }
    }

    function deleteLicence(lic) {
        setConfirmTarget(lic);
        setConfirmOpen(true);
    }

    function confirmDelete() {
        router.delete(route('admin.software-licences.destroy', confirmTarget.id));
        setConfirmOpen(false);
        setConfirmTarget(null);
    }

    const expiringSoon = licences.filter(l => l.expiry_status === 'expiring_soon');
    const expired = licences.filter(l => l.expiry_status === 'expired');

    return (
        <AuthenticatedLayout>
            <Head title="Software Licences" />
            <div className="p-6 space-y-4">

                {flash?.success && (
                    <InlineNotification kind="success" title="Success" subtitle={flash.success} lowContrast onClose={() => {}} />
                )}
                {expiringSoon.length > 0 && (
                    <InlineNotification
                        kind="warning"
                        title={`${expiringSoon.length} licence(s) expiring within 30 days:`}
                        subtitle={expiringSoon.map(l => l.software_name).join(', ')}
                        lowContrast
                        onClose={() => {}}
                    />
                )}
                {expired.length > 0 && (
                    <InlineNotification
                        kind="error"
                        title={`${expired.length} expired licence(s):`}
                        subtitle={expired.map(l => l.software_name).join(', ')}
                        lowContrast
                        onClose={() => {}}
                    />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Software Licence Tracking</h1>
                    <Button renderIcon={Add} onClick={openNew} kind="primary" size="sm">Add Licence</Button>
                </div>

                <TableToolbar>
                    <TableToolbarContent>
                        <TableToolbarSearch
                            value={search}
                            onChange={e => doSearch(e.target.value)}
                            placeholder="Search software or vendor…"
                            persistent
                        />
                    </TableToolbarContent>
                </TableToolbar>

                {licences.length === 0 ? (
                    <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.875rem' }}>No software licences recorded yet.</p>
                ) : (
                    <Table size="lg" useZebraStyles>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Software</TableHeader>
                                <TableHeader>Vendor</TableHeader>
                                <TableHeader>Type</TableHeader>
                                <TableHeader>Seats</TableHeader>
                                <TableHeader>Expiry</TableHeader>
                                <TableHeader>Expiry Status</TableHeader>
                                <TableHeader>Cost / Year</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader>Actions</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {licences.map(lic => (
                                <TableRow key={lic.id}>
                                    <TableCell><strong>{lic.software_name}</strong></TableCell>
                                    <TableCell>{lic.vendor_name || '—'}</TableCell>
                                    <TableCell style={{ textTransform: 'capitalize' }}>{lic.licence_type}</TableCell>
                                    <TableCell>
                                        {lic.seat_count
                                            ? <span>{lic.seats_used}/{lic.seat_count} <small style={{ color: '#9ca3af' }}>({lic.seats_available} free)</small></span>
                                            : <span style={{ color: '#9ca3af' }}>Unlimited</span>
                                        }
                                    </TableCell>
                                    <TableCell>{lic.expiry_date || '—'}</TableCell>
                                    <TableCell>
                                        <Tag type={expiryTagType(lic.expiry_status)} size="sm">{expiryLabel(lic.expiry_status)}</Tag>
                                    </TableCell>
                                    <TableCell>
                                        {lic.annual_cost ? `$${Number(lic.annual_cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Tag type={statusTagType(lic.status)} size="sm">{lic.status}</Tag>
                                    </TableCell>
                                    <TableCell>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button kind="ghost" size="sm" renderIcon={Edit} iconDescription="Edit" onClick={() => openEdit(lic)} hasIconOnly />
                                            <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} iconDescription="Delete" onClick={() => deleteLicence(lic)} hasIconOnly />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {/* Add / Edit Form Modal */}
                <Modal
                    open={showForm}
                    modalHeading={editing ? 'Edit Licence' : 'Add Software Licence'}
                    primaryButtonText={editing ? 'Save Changes' : 'Add Licence'}
                    secondaryButtonText="Cancel"
                    onRequestClose={() => { setShowForm(false); setEditing(null); }}
                    onRequestSubmit={submitForm}
                    size="lg"
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <TextInput id="sl-name" labelText="Software Name *" value={form.software_name} onChange={e => setForm(f => ({ ...f, software_name: e.target.value }))} required />
                        <TextInput id="sl-vendor" labelText="Vendor / Publisher" value={form.vendor_name} onChange={e => setForm(f => ({ ...f, vendor_name: e.target.value }))} />
                        <TextInput id="sl-key" labelText="Licence Key" placeholder={editing ? '(leave blank to keep unchanged)' : ''} value={form.licence_key} onChange={e => setForm(f => ({ ...f, licence_key: e.target.value }))} />
                        <Select id="sl-type" labelText="Licence Type *" value={form.licence_type} onChange={e => setForm(f => ({ ...f, licence_type: e.target.value }))}>
                            <SelectItem value="subscription" text="Subscription" />
                            <SelectItem value="perpetual" text="Perpetual" />
                            <SelectItem value="per-seat" text="Per-Seat" />
                        </Select>
                        <TextInput id="sl-seats" labelText="Total Seats" type="number" placeholder="leave blank if unlimited" value={form.seat_count} onChange={e => setForm(f => ({ ...f, seat_count: e.target.value }))} />
                        <TextInput id="sl-used" labelText="Seats In Use" type="number" value={form.seats_used} onChange={e => setForm(f => ({ ...f, seats_used: e.target.value }))} />
                        <TextInput id="sl-purchase-date" labelText="Purchase Date" type="date" value={form.purchase_date} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))} />
                        <TextInput id="sl-expiry" labelText="Expiry Date" type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} />
                        <TextInput id="sl-cost" labelText="Purchase Cost ($)" type="number" value={form.purchase_cost} onChange={e => setForm(f => ({ ...f, purchase_cost: e.target.value }))} />
                        <TextInput id="sl-annual" labelText="Annual Renewal Cost ($)" type="number" value={form.annual_cost} onChange={e => setForm(f => ({ ...f, annual_cost: e.target.value }))} />
                        <Select id="sl-status" labelText="Status *" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                            <SelectItem value="active" text="Active" />
                            <SelectItem value="expired" text="Expired" />
                            <SelectItem value="cancelled" text="Cancelled" />
                        </Select>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <TextArea id="sl-notes" labelText="Notes" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                        </div>
                    </div>
                </Modal>

                {/* Delete confirmation */}
                <Modal
                    open={confirmOpen}
                    danger
                    modalHeading="Delete Licence"
                    primaryButtonText="Delete"
                    secondaryButtonText="Cancel"
                    onRequestClose={() => { setConfirmOpen(false); setConfirmTarget(null); }}
                    onRequestSubmit={confirmDelete}
                >
                    {confirmTarget && <p>Delete licence for &ldquo;<strong>{confirmTarget.software_name}</strong>&rdquo;?</p>}
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
