import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Button, InlineNotification,
    Modal, TextInput,
    Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/icons-react';

export default function Vendors({ auth, vendors, flash }) {
    const [showCreate, setShowCreate] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);

    const createForm = useForm({
        name: '', product_category: '', business_unit: '', owner: '', contact_email: '',
    });

    const editForm = useForm({
        name: '', product_category: '', business_unit: '', owner: '', contact_email: '',
    });

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('admin.vendors.store'), {
            onSuccess: () => { createForm.reset(); setShowCreate(false); },
        });
    };

    const openEdit = (vendor) => {
        setEditTarget(vendor);
        editForm.setData({
            name: vendor.name, product_category: vendor.product_category,
            business_unit: vendor.business_unit || '', owner: vendor.owner || '',
            contact_email: vendor.contact_email,
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        editForm.put(route('admin.vendors.update', editTarget.id), {
            onSuccess: () => setEditTarget(null),
        });
    };

    const handleDelete = (id) => {
        setConfirmTarget(id);
        setConfirmOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.vendors.destroy', confirmTarget));
        setConfirmOpen(false);
        setConfirmTarget(null);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Vendors" />
            <div className="p-6 space-y-4">
                {flash?.success && (
                    <InlineNotification kind="success" title="Success" subtitle={flash.success} lowContrast onClose={() => {}} />
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button renderIcon={Add} onClick={() => setShowCreate(true)} kind="primary" size="sm">
                        Add Vendor
                    </Button>
                </div>

                <Table size="lg" useZebraStyles>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Name</TableHeader>
                            <TableHeader>Category</TableHeader>
                            <TableHeader>Email</TableHeader>
                            <TableHeader>Business Unit</TableHeader>
                            <TableHeader>Owner</TableHeader>
                            <TableHeader>Actions</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {vendors.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} style={{ textAlign: 'center', color: 'var(--cds-text-placeholder)' }}>No vendors found. Add one above.</TableCell>
                            </TableRow>
                        )}
                        {vendors.map(vendor => (
                            <TableRow key={vendor.id}>
                                <TableCell><strong>{vendor.name}</strong></TableCell>
                                <TableCell>{vendor.product_category}</TableCell>
                                <TableCell>{vendor.contact_email}</TableCell>
                                <TableCell>{vendor.business_unit || '—'}</TableCell>
                                <TableCell>{vendor.owner || '—'}</TableCell>
                                <TableCell>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button kind="ghost" size="sm" renderIcon={Edit} iconDescription="Edit" onClick={() => openEdit(vendor)} hasIconOnly />
                                        <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} iconDescription="Delete" onClick={() => handleDelete(vendor.id)} hasIconOnly />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Create Modal */}
                <Modal
                    open={showCreate}
                    modalHeading="Add Vendor"
                    primaryButtonText={createForm.processing ? 'Saving…' : 'Save'}
                    secondaryButtonText="Cancel"
                    onRequestClose={() => setShowCreate(false)}
                    onRequestSubmit={handleCreate}
                    primaryButtonDisabled={createForm.processing}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <TextInput id="v-name" labelText="Vendor Name" autoFocus value={createForm.data.name} onChange={e => createForm.setData('name', e.target.value)} required />
                        <TextInput id="v-category" labelText="Product Category" value={createForm.data.product_category} onChange={e => createForm.setData('product_category', e.target.value)} required />
                        <TextInput id="v-email" labelText="Contact Email" type="email" value={createForm.data.contact_email} onChange={e => createForm.setData('contact_email', e.target.value)} required />
                        <TextInput id="v-bu" labelText="Business Unit" value={createForm.data.business_unit} onChange={e => createForm.setData('business_unit', e.target.value)} />
                        <TextInput id="v-owner" labelText="Owner" value={createForm.data.owner} onChange={e => createForm.setData('owner', e.target.value)} />
                    </div>
                </Modal>

                {/* Edit Modal */}
                <Modal
                    open={!!editTarget}
                    modalHeading="Edit Vendor"
                    primaryButtonText={editForm.processing ? 'Saving…' : 'Save'}
                    secondaryButtonText="Cancel"
                    onRequestClose={() => setEditTarget(null)}
                    onRequestSubmit={handleUpdate}
                    primaryButtonDisabled={editForm.processing}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <TextInput id="ve-name" labelText="Vendor Name" autoFocus value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} required />
                        <TextInput id="ve-category" labelText="Product Category" value={editForm.data.product_category} onChange={e => editForm.setData('product_category', e.target.value)} required />
                        <TextInput id="ve-email" labelText="Contact Email" type="email" value={editForm.data.contact_email} onChange={e => editForm.setData('contact_email', e.target.value)} required />
                        <TextInput id="ve-bu" labelText="Business Unit" value={editForm.data.business_unit} onChange={e => editForm.setData('business_unit', e.target.value)} />
                        <TextInput id="ve-owner" labelText="Owner" value={editForm.data.owner} onChange={e => editForm.setData('owner', e.target.value)} />
                    </div>
                </Modal>

                {/* Delete confirmation */}
                <Modal
                    open={confirmOpen}
                    danger
                    modalHeading="Delete Vendor"
                    primaryButtonText="Delete"
                    secondaryButtonText="Cancel"
                    onRequestClose={() => { setConfirmOpen(false); setConfirmTarget(null); }}
                    onRequestSubmit={confirmDelete}
                >
                    <p>Are you sure you want to delete this vendor?</p>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
