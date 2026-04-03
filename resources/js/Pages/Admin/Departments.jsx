import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Button, InlineNotification, Tag,
    ComposedModal, Modal, ModalHeader, ModalBody, ModalFooter, TextInput,
    Select, SelectItem,
    Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/icons-react';

export default function Departments({ auth, departments, users, flash }) {
    const [modal, setModal] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);

    const createForm = useForm({ name: '', manager_id: '' });
    const editForm   = useForm({ name: '', manager_id: '' });

    const openCreate = () => { createForm.reset(); setModal('create'); };
    const openEdit   = (dept) => { editForm.setData({ name: dept.name, manager_id: dept.manager_id || '' }); setModal(dept); };
    const closeModal = () => setModal(null);

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('admin.departments.store'), { onSuccess: closeModal });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        editForm.put(route('admin.departments.update', modal.id), { onSuccess: closeModal });
    };

    const handleDelete = (dept) => {
        setConfirmTarget(dept);
        setConfirmOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.departments.destroy', confirmTarget.id));
        setConfirmOpen(false);
        setConfirmTarget(null);
    };

    const isCreate = modal === 'create';
    const activeForm = isCreate ? createForm : editForm;
    const handleSubmit = isCreate ? handleCreate : handleUpdate;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Department Management" />

            <div className="p-6 space-y-4">
                {flash?.success && (
                    <InlineNotification kind="success" title="Success" subtitle={flash.success} lowContrast onClose={() => {}} />
                )}
                {flash?.errors?.department && (
                    <InlineNotification kind="error" title="Error" subtitle={flash.errors.department} lowContrast onClose={() => {}} />
                )}

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {[
                        { label: 'Total Departments', value: departments.length },
                        { label: 'Total Users', value: departments.reduce((s, d) => s + (d.users_count ?? 0), 0) },
                        { label: 'Total Assets', value: departments.reduce((s, d) => s + (d.assets_count ?? 0), 0) },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white border border-gray-200 p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--cds-text-placeholder)' }}>{stat.label}</p>
                            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--cds-link-primary)' }}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Department Management</h2>
                    <Button renderIcon={Add} onClick={openCreate} kind="primary" size="sm">
                        Add Department
                    </Button>
                </div>

                <Table size="lg" useZebraStyles>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Department</TableHeader>
                            <TableHeader>Manager</TableHeader>
                            <TableHeader>Users</TableHeader>
                            <TableHeader>Assets</TableHeader>
                            <TableHeader>Actions</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {departments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} style={{ textAlign: 'center', color: 'var(--cds-text-secondary)' }}>
                                    No departments yet. Click <strong>Add Department</strong> to get started.
                                </TableCell>
                            </TableRow>
                        ) : departments.map(dept => (
                            <TableRow key={dept.id}>
                                <TableCell><strong>{dept.name}</strong></TableCell>
                                <TableCell>{dept.manager?.name || <em style={{ color: 'var(--cds-text-placeholder)' }}>Unassigned</em>}</TableCell>
                                <TableCell>
                                    <Tag type="blue" size="sm">{dept.users_count}</Tag>
                                </TableCell>
                                <TableCell>
                                    <Tag type="green" size="sm">{dept.assets_count}</Tag>
                                </TableCell>
                                <TableCell>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button kind="ghost" size="sm" renderIcon={Edit} iconDescription="Edit" onClick={() => openEdit(dept)} hasIconOnly />
                                        <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} iconDescription="Delete" onClick={() => handleDelete(dept)} hasIconOnly />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Create / Edit Modal */}
            <ComposedModal
                open={!!modal}
                onClose={closeModal}
            >
                <ModalHeader title={isCreate ? 'Add New Department' : `Edit — ${modal?.name}`} />
                <ModalBody>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
                    <TextInput
                        id="dept-name"
                        labelText="Department Name"
                        placeholder="e.g. Finance, IT, Operations"
                        autoFocus
                        value={activeForm.data.name}
                        onChange={e => activeForm.setData('name', e.target.value)}
                        invalid={!!activeForm.errors.name}
                        invalidText={activeForm.errors.name}
                        required
                    />
                    <Select
                        id="dept-manager"
                        labelText="Department Manager"
                        value={activeForm.data.manager_id}
                        onChange={e => activeForm.setData('manager_id', e.target.value)}
                    >
                        <SelectItem value="" text="— No Manager —" />
                        {users.map(u => <SelectItem key={u.id} value={u.id} text={u.name} />)}
                    </Select>
                </div>
                </ModalBody>
                <ModalFooter
                    primaryButtonText={activeForm.processing ? 'Saving…' : 'Save Department'}
                    secondaryButtonText="Cancel"
                    onRequestSubmit={handleSubmit}
                    primaryButtonDisabled={activeForm.processing}
                />
            </ComposedModal>

            {/* Delete confirmation */}
            <Modal
                open={confirmOpen}
                danger
                modalHeading="Delete Department"
                primaryButtonText="Delete"
                secondaryButtonText="Cancel"
                onRequestClose={() => { setConfirmOpen(false); setConfirmTarget(null); }}
                onRequestSubmit={confirmDelete}
            >
                {confirmTarget && (
                    <p>Delete &ldquo;<strong>{confirmTarget.name}</strong>&rdquo;? Departments with users or assets cannot be deleted.</p>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
