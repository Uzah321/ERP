import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Button, InlineNotification,
    Modal, TextInput, TextArea,
    Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/icons-react';

export default function Locations({ auth, locations, flash }) {
    const [modal, setModal] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({ name: '', address: '' });

    const openCreate = () => { reset(); setModal('create'); };
    const openEdit = (loc) => { setData({ name: loc.name, address: loc.address || '' }); setModal(loc); };
    const closeModal = () => setModal(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modal === 'create') {
            post(route('admin.locations.store'), { onSuccess: closeModal });
        } else {
            put(route('admin.locations.update', modal.id), { onSuccess: closeModal });
        }
    };

    const handleDelete = (loc) => {
        setConfirmTarget(loc);
        setConfirmOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.locations.destroy', confirmTarget.id));
        setConfirmOpen(false);
        setConfirmTarget(null);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Asset Locations" />

            <div className="p-6 space-y-4">
                {flash?.success && (
                    <InlineNotification
                        kind="success"
                        title="Success"
                        subtitle={flash.success}
                        lowContrast
                        onClose={() => {}}
                    />
                )}
                {Object.keys(errors).length > 0 && (
                    <InlineNotification
                        kind="error"
                        title="Error"
                        subtitle={Object.values(errors)[0]}
                        lowContrast
                        onClose={() => {}}
                    />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Manage Locations</h2>
                    <Button renderIcon={Add} onClick={openCreate} kind="primary" size="sm">
                        New Location
                    </Button>
                </div>

                <Table size="lg" useZebraStyles>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Name</TableHeader>
                            <TableHeader>Address / Details</TableHeader>
                            <TableHeader>Assets</TableHeader>
                            <TableHeader>Actions</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {locations.map(loc => (
                            <TableRow key={loc.id}>
                                <TableCell><strong>{loc.name}</strong></TableCell>
                                <TableCell>{loc.address || '—'}</TableCell>
                                <TableCell>{loc.assets_count || 0}</TableCell>
                                <TableCell>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button kind="ghost" size="sm" renderIcon={Edit} iconDescription="Edit" onClick={() => openEdit(loc)} hasIconOnly />
                                        <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} iconDescription="Delete" onClick={() => handleDelete(loc)} hasIconOnly />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Create / Edit Modal */}
            <Modal
                open={!!modal}
                modalHeading={modal === 'create' ? 'New Location' : 'Edit Location'}
                primaryButtonText={processing ? 'Saving…' : 'Save'}
                secondaryButtonText="Cancel"
                onRequestClose={closeModal}
                onRequestSubmit={handleSubmit}
                primaryButtonDisabled={processing}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <TextInput
                        id="loc-name"
                        labelText="Location Name"
                        autoFocus
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        invalid={!!errors.name}
                        invalidText={errors.name}
                        required
                    />
                    <TextArea
                        id="loc-address"
                        labelText="Address / Description"
                        value={data.address}
                        onChange={e => setData('address', e.target.value)}
                        rows={3}
                    />
                </div>
            </Modal>

            {/* Delete confirmation modal */}
            <Modal
                open={confirmOpen}
                danger
                modalHeading="Delete Location"
                primaryButtonText="Delete"
                secondaryButtonText="Cancel"
                onRequestClose={() => { setConfirmOpen(false); setConfirmTarget(null); }}
                onRequestSubmit={confirmDelete}
            >
                {confirmTarget && (
                    <p>Delete location &ldquo;<strong>{confirmTarget.name}</strong>&rdquo;? Locations with assigned assets cannot be deleted.</p>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
