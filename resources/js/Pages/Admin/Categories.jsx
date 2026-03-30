import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Button, InlineNotification,
    Modal, TextInput, TextArea,
    Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
    TableToolbar, TableToolbarContent,
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/icons-react';

export default function Categories({ auth, categories, flash }) {
    const [modal, setModal] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({ name: '', description: '' });

    const openCreate = () => { reset(); setModal('create'); };
    const openEdit = (cat) => { setData({ name: cat.name, description: cat.description || '' }); setModal(cat); };
    const closeModal = () => setModal(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modal === 'create') {
            post(route('admin.categories.store'), { onSuccess: closeModal });
        } else {
            put(route('admin.categories.update', modal.id), { onSuccess: closeModal });
        }
    };

    const handleDelete = (cat) => {
        setConfirmTarget(cat);
        setConfirmOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.categories.destroy', confirmTarget.id));
        setConfirmOpen(false);
        setConfirmTarget(null);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Asset Categories" />

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
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Manage Categories</h2>
                    <Button renderIcon={Add} onClick={openCreate} kind="primary" size="sm">
                        New Category
                    </Button>
                </div>

                <Table size="lg" useZebraStyles>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Name</TableHeader>
                            <TableHeader>Description</TableHeader>
                            <TableHeader>Assets</TableHeader>
                            <TableHeader>Actions</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.map(cat => (
                            <TableRow key={cat.id}>
                                <TableCell><strong>{cat.name}</strong></TableCell>
                                <TableCell>{cat.description || '—'}</TableCell>
                                <TableCell>{cat.assets_count || 0}</TableCell>
                                <TableCell>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button kind="ghost" size="sm" renderIcon={Edit} iconDescription="Edit" onClick={() => openEdit(cat)} hasIconOnly />
                                        <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} iconDescription="Delete" onClick={() => handleDelete(cat)} hasIconOnly />
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
                modalHeading={modal === 'create' ? 'New Category' : `Edit Category`}
                primaryButtonText={processing ? 'Saving…' : 'Save'}
                secondaryButtonText="Cancel"
                onRequestClose={closeModal}
                onRequestSubmit={handleSubmit}
                primaryButtonDisabled={processing}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <TextInput
                        id="cat-name"
                        labelText="Category Name"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        invalid={!!errors.name}
                        invalidText={errors.name}
                        required
                    />
                    <TextArea
                        id="cat-description"
                        labelText="Description"
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                        rows={3}
                    />
                </div>
            </Modal>

            {/* Delete confirmation modal */}
            <Modal
                open={confirmOpen}
                danger
                modalHeading="Delete Category"
                primaryButtonText="Delete"
                secondaryButtonText="Cancel"
                onRequestClose={() => { setConfirmOpen(false); setConfirmTarget(null); }}
                onRequestSubmit={confirmDelete}
            >
                {confirmTarget && (
                    <p>Delete category &ldquo;<strong>{confirmTarget.name}</strong>&rdquo;? Categories with assigned assets cannot be deleted.</p>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
