import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Button, InlineNotification, Tag,
    Modal, TextInput, TextArea,
    Select, SelectItem,
    Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
} from '@carbon/react';
import { Add, Renew } from '@carbon/icons-react';

export default function Allocations({ auth, allocations, assets, departments, users, flash }) {
    const [showCreate, setShowCreate] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);

    const form = useForm({
        asset_id: '',
        department_id: '',
        user_id: '',
        allocated_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const handleCreate = (e) => {
        e.preventDefault();
        form.post(route('admin.allocations.store'), {
            onSuccess: () => { form.reset(); setShowCreate(false); },
        });
    };

    const handleReturn = (id) => {
        setConfirmTarget(id);
        setConfirmOpen(true);
    };

    const confirmReturn = () => {
        router.patch(route('admin.allocations.return', confirmTarget));
        setConfirmOpen(false);
        setConfirmTarget(null);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Asset Allocations" />
            <div className="p-6 space-y-4">
                {flash?.success && (
                    <InlineNotification kind="success" title="Success" subtitle={flash.success} lowContrast onClose={() => {}} />
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button renderIcon={Add} onClick={() => setShowCreate(true)} kind="primary" size="sm">
                        Allocate Asset
                    </Button>
                </div>

                <Table size="lg" useZebraStyles>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Asset</TableHeader>
                            <TableHeader>Department</TableHeader>
                            <TableHeader>Assigned To</TableHeader>
                            <TableHeader>Allocated By</TableHeader>
                            <TableHeader>Date</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Actions</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {allocations.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} style={{ textAlign: 'center', color: '#9ca3af' }}>No allocations found.</TableCell>
                            </TableRow>
                        )}
                        {allocations.map(a => (
                            <TableRow key={a.id}>
                                <TableCell>
                                    <div><strong>{a.asset?.name}</strong></div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{a.asset?.barcode}</div>
                                </TableCell>
                                <TableCell>{a.department?.name || '—'}</TableCell>
                                <TableCell>{a.user?.name || '—'}</TableCell>
                                <TableCell>{a.allocator?.name}</TableCell>
                                <TableCell>{a.allocated_date}</TableCell>
                                <TableCell>
                                    {a.returned_date
                                        ? <Tag type="gray" size="sm">Returned {a.returned_date}</Tag>
                                        : <Tag type="green" size="sm">Active</Tag>
                                    }
                                </TableCell>
                                <TableCell>
                                    {!a.returned_date && (
                                        <Button kind="secondary" size="sm" renderIcon={Renew} onClick={() => handleReturn(a.id)}>
                                            Return
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Allocate Modal */}
                <Modal
                    open={showCreate}
                    modalHeading="Allocate Asset"
                    primaryButtonText={form.processing ? 'Allocating…' : 'Allocate'}
                    secondaryButtonText="Cancel"
                    onRequestClose={() => setShowCreate(false)}
                    onRequestSubmit={handleCreate}
                    primaryButtonDisabled={form.processing}
                    size="md"
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Select
                            id="alloc-asset"
                            labelText="Asset *"
                            value={form.data.asset_id}
                            onChange={e => form.setData('asset_id', e.target.value)}
                            invalid={!!form.errors.asset_id}
                            invalidText={form.errors.asset_id}
                            required
                        >
                            <SelectItem value="" text="— Select Asset —" />
                            {assets.filter(a => ['Available', 'Active', 'Purchased', 'Registered'].includes(a.status)).map(a => (
                                <SelectItem key={a.id} value={a.id} text={`${a.name} (${a.barcode})`} />
                            ))}
                        </Select>
                        <TextInput
                            id="alloc-date"
                            labelText="Allocated Date *"
                            type="date"
                            value={form.data.allocated_date}
                            onChange={e => form.setData('allocated_date', e.target.value)}
                            required
                        />
                        <Select
                            id="alloc-dept"
                            labelText="Department"
                            value={form.data.department_id}
                            onChange={e => form.setData('department_id', e.target.value)}
                        >
                            <SelectItem value="" text="— Select Department —" />
                            {departments.map(d => <SelectItem key={d.id} value={d.id} text={d.name} />)}
                        </Select>
                        <Select
                            id="alloc-user"
                            labelText="Assign to User"
                            value={form.data.user_id}
                            onChange={e => form.setData('user_id', e.target.value)}
                        >
                            <SelectItem value="" text="— Select User —" />
                            {users.map(u => <SelectItem key={u.id} value={u.id} text={u.name} />)}
                        </Select>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <TextArea
                                id="alloc-notes"
                                labelText="Notes"
                                value={form.data.notes}
                                onChange={e => form.setData('notes', e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>
                </Modal>

                {/* Return confirmation */}
                <Modal
                    open={confirmOpen}
                    danger
                    modalHeading="Confirm Return"
                    primaryButtonText="Mark as Returned"
                    secondaryButtonText="Cancel"
                    onRequestClose={() => { setConfirmOpen(false); setConfirmTarget(null); }}
                    onRequestSubmit={confirmReturn}
                >
                    <p>Mark this asset as returned?</p>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
