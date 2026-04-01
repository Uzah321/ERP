import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Button, InlineNotification,
    Modal, TextInput,
    Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/icons-react';

export default function PositionSpecifications({ auth, specifications, flash }) {
    const [editTarget, setEditTarget] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);

    const createForm = useForm({ position_name: '', asset_type: '', specifications: '' });
    const editForm = useForm({ position_name: '', asset_type: '', specifications: '' });

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('admin.position-specs.store'), {
            onSuccess: () => { createForm.reset(); setShowCreate(false); },
        });
    };

    const openEdit = (spec) => {
        setEditTarget(spec);
        editForm.setData({
            position_name: spec.position_name,
            asset_type: spec.asset_type,
            specifications: spec.specifications,
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        editForm.put(route('admin.position-specs.update', editTarget.id), {
            onSuccess: () => setEditTarget(null),
        });
    };

    const handleDelete = (id) => {
        setConfirmTarget(id);
        setConfirmOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.position-specs.destroy', confirmTarget));
        setConfirmOpen(false);
        setConfirmTarget(null);
    };

    const grouped = specifications.reduce((acc, spec) => {
        if (!acc[spec.position_name]) acc[spec.position_name] = [];
        acc[spec.position_name].push(spec);
        return acc;
    }, {});

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Position Specifications" />
            <div className="p-6 space-y-6">

                {flash?.success && (
                    <InlineNotification kind="success" title="Success" subtitle={flash.success} lowContrast onClose={() => {}} />
                )}

                <InlineNotification
                    kind="info"
                    title="How it works:"
                    subtitle="Define what IT asset specifications each staff position should receive. When users submit an asset request, the system will auto-fill the recommended specs based on the position and asset type selected."
                    lowContrast
                    onClose={() => {}}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button renderIcon={Add} onClick={() => setShowCreate(true)} kind="primary" size="sm">
                        Add Specification
                    </Button>
                </div>

                <Table size="lg" useZebraStyles>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Job</TableHeader>
                            <TableHeader>Asset Type</TableHeader>
                            <TableHeader>Specifications</TableHeader>
                            <TableHeader>Actions</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {specifications.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} style={{ textAlign: 'center', color: '#9ca3af' }}>No position specifications defined yet. Click &quot;Add Specification&quot; to get started.</TableCell>
                            </TableRow>
                        )}
                        {specifications.map(spec => (
                            <TableRow key={spec.id}>
                                <TableCell style={{ textTransform: 'capitalize' }}><strong>{spec.position_name}</strong></TableCell>
                                <TableCell>{spec.asset_type}</TableCell>
                                <TableCell>{spec.specifications}</TableCell>
                                <TableCell>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button kind="ghost" size="sm" renderIcon={Edit} iconDescription="Edit" onClick={() => openEdit(spec)} hasIconOnly />
                                        <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} iconDescription="Delete" onClick={() => handleDelete(spec.id)} hasIconOnly />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Summary by Job */}
                {Object.keys(grouped).length > 0 && (
                    <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Summary by Job</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {Object.entries(grouped).map(([position, specs]) => (
                                <div key={position} className="bg-white border border-gray-200 p-4 shadow-sm">
                                    <h4 style={{ fontWeight: 600, textTransform: 'capitalize', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span>
                                        {position}
                                    </h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                                        {specs.map(s => (
                                            <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#6b7280' }}>{s.asset_type}:</span>
                                                <span style={{ fontWeight: 500 }}>{s.specifications}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Create Modal */}
                <Modal
                    open={showCreate}
                    modalHeading="Add Specification"
                    primaryButtonText={createForm.processing ? 'Saving…' : 'Save'}
                    secondaryButtonText="Cancel"
                    onRequestClose={() => setShowCreate(false)}
                    onRequestSubmit={handleCreate}
                    primaryButtonDisabled={createForm.processing}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <TextInput id="ps-pos" labelText="Job *" placeholder="e.g. Manager, HOD, Staff, Intern" autoFocus value={createForm.data.position_name} onChange={e => createForm.setData('position_name', e.target.value)} invalid={!!createForm.errors.position_name} invalidText={createForm.errors.position_name} required />
                        <TextInput id="ps-type" labelText="Asset Type *" placeholder="e.g. Laptop, Desktop, Monitor" value={createForm.data.asset_type} onChange={e => createForm.setData('asset_type', e.target.value)} invalid={!!createForm.errors.asset_type} invalidText={createForm.errors.asset_type} required />
                        <TextInput id="ps-spec" labelText="Specifications *" placeholder="e.g. 32GB+ RAM, 1TB+ storage, Core i7" value={createForm.data.specifications} onChange={e => createForm.setData('specifications', e.target.value)} invalid={!!createForm.errors.specifications} invalidText={createForm.errors.specifications} required />
                    </div>
                </Modal>

                {/* Edit Modal */}
                <Modal
                    open={!!editTarget}
                    modalHeading="Edit Specification"
                    primaryButtonText={editForm.processing ? 'Saving…' : 'Save'}
                    secondaryButtonText="Cancel"
                    onRequestClose={() => setEditTarget(null)}
                    onRequestSubmit={handleUpdate}
                    primaryButtonDisabled={editForm.processing}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <TextInput id="eps-pos" labelText="Job *" autoFocus value={editForm.data.position_name} onChange={e => editForm.setData('position_name', e.target.value)} required />
                        <TextInput id="eps-type" labelText="Asset Type *" value={editForm.data.asset_type} onChange={e => editForm.setData('asset_type', e.target.value)} required />
                        <TextInput id="eps-spec" labelText="Specifications *" value={editForm.data.specifications} onChange={e => editForm.setData('specifications', e.target.value)} required />
                    </div>
                </Modal>

                {/* Delete confirmation */}
                <Modal
                    open={confirmOpen}
                    danger
                    modalHeading="Delete Specification"
                    primaryButtonText="Delete"
                    secondaryButtonText="Cancel"
                    onRequestClose={() => { setConfirmOpen(false); setConfirmTarget(null); }}
                    onRequestSubmit={confirmDelete}
                >
                    <p>Are you sure you want to delete this specification?</p>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
