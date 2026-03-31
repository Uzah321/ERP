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

export default function Allocations({ auth, allocations, pendingTransfers, assets, departments, users, flash }) {
    const [showCreate, setShowCreate] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [transferConfirm, setTransferConfirm] = useState({ open: false, id: null, status: null });

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

    const handleTransferAction = (id, status) => {
        setTransferConfirm({ open: true, id, status });
    };

    const confirmTransferAction = () => {
        router.patch(route('transfers.update', transferConfirm.id), {
            status: transferConfirm.status,
        }, {
            preserveScroll: true,
            onFinish: () => setTransferConfirm({ open: false, id: null, status: null }),
        });
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

                <div className="space-y-3">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Pending transfer approvals</h2>
                        <p className="text-sm text-gray-600">Review and action transfer requests from the same workspace.</p>
                    </div>

                    <Table size="lg" useZebraStyles>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Asset</TableHeader>
                                <TableHeader>Requested By</TableHeader>
                                <TableHeader>Target Department</TableHeader>
                                <TableHeader>Target User / Location</TableHeader>
                                <TableHeader>Reason</TableHeader>
                                <TableHeader>Actions</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendingTransfers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} style={{ textAlign: 'center', color: '#9ca3af' }}>
                                        No pending transfer approvals.
                                    </TableCell>
                                </TableRow>
                            )}
                            {pendingTransfers.map((transfer) => (
                                <TableRow key={transfer.id}>
                                    <TableCell>
                                        <div><strong>{transfer.asset?.name}</strong></div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{transfer.asset?.barcode}</div>
                                    </TableCell>
                                    <TableCell>{transfer.requester?.name || '—'}</TableCell>
                                    <TableCell>{transfer.target_department?.name || '—'}</TableCell>
                                    <TableCell>
                                        {transfer.target_user?.name || transfer.target_location?.name || '—'}
                                    </TableCell>
                                    <TableCell>{transfer.reason}</TableCell>
                                    <TableCell>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button
                                                kind="primary"
                                                size="sm"
                                                onClick={() => handleTransferAction(transfer.id, 'approved')}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                kind="danger--ghost"
                                                size="sm"
                                                onClick={() => handleTransferAction(transfer.id, 'rejected')}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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

                <Modal
                    open={transferConfirm.open}
                    danger={transferConfirm.status === 'rejected'}
                    modalHeading={`Confirm ${transferConfirm.status === 'approved' ? 'Approval' : 'Rejection'}`}
                    primaryButtonText={transferConfirm.status === 'approved' ? 'Approve request' : 'Reject request'}
                    secondaryButtonText="Cancel"
                    onRequestClose={() => setTransferConfirm({ open: false, id: null, status: null })}
                    onRequestSubmit={confirmTransferAction}
                >
                    <p>
                        {transferConfirm.status === 'approved'
                            ? 'Approve this transfer request and move the asset to the requested destination?'
                            : 'Reject this transfer request?'}
                    </p>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
