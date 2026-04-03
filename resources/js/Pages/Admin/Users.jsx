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

export default function Users({ auth, users, departments, flash }) {
    const [editing, setEditing] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);

    const createForm = useForm({
        name: '', email: '', department_id: '', role: 'user', approval_position: '',
    });

    const editForm = useForm({
        name: '', email: '', department_id: '', role: 'user', approval_position: '',
    });

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('admin.users.store'), {
            onSuccess: () => { createForm.reset(); setShowCreate(false); },
        });
    };

    const handleEdit = (user) => {
        setEditing(user.id);
        editForm.setData({
            name: user.name, email: user.email,
            department_id: user.department_id || '', role: user.role || 'user',
            approval_position: user.approval_position || '',
        });
    };

    const handleUpdate = (e, id) => {
        e.preventDefault();
        editForm.put(route('admin.users.update', id), {
            onSuccess: () => setEditing(null),
        });
    };

    const handleDelete = (id) => {
        setConfirmTarget(id);
        setConfirmOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.users.destroy', confirmTarget));
        setConfirmOpen(false);
        setConfirmTarget(null);
    };

    const handleToggleActive = (id) => {
        router.patch(route('admin.users.toggle', id));
    };

    const approvalPositionLabel = (pos) => {
        const labels = {
            it_manager: 'IT Manager',
            finance_operations: 'Finance Operations',
            it_head: 'IT Head of Technology',
            finance_director: 'Finance Director',
        };
        return labels[pos] || null;
    };

    const roleTagType = (role) => {
        if (role === 'executive') return 'red';
        if (role === 'admin') return 'purple';
        return 'gray';
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Users" />
            <div className="p-6 space-y-4">
                {flash?.success && (
                    <InlineNotification kind="success" title="Success" subtitle={flash.success} lowContrast onClose={() => {}} />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{users.length} user account(s) in the system</p>
                    <Button renderIcon={Add} onClick={() => setShowCreate(!showCreate)} kind="primary" size="sm">
                        Invite User
                    </Button>
                </div>

                {/* Create form modal */}
                <ComposedModal
                    open={showCreate}
                    onClose={() => setShowCreate(false)}
                >
                    <ModalHeader title="Invite User" />
                    <ModalBody>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem' }}>
                        <TextInput
                            id="user-name"
                            labelText="Full Name"
                            autoFocus
                            value={createForm.data.name}
                            onChange={e => createForm.setData('name', e.target.value)}
                            invalid={!!createForm.errors.name}
                            invalidText={createForm.errors.name}
                            required
                        />
                        <TextInput
                            id="user-email"
                            labelText="Email"
                            type="email"
                            value={createForm.data.email}
                            onChange={e => createForm.setData('email', e.target.value)}
                            invalid={!!createForm.errors.email}
                            invalidText={createForm.errors.email}
                            required
                        />
                        <Select
                            id="user-department"
                            labelText="Department"
                            value={createForm.data.department_id}
                            onChange={e => createForm.setData('department_id', e.target.value)}
                            required
                        >
                            <SelectItem value="" text="Select Department" />
                            {departments.map(d => <SelectItem key={d.id} value={d.id} text={d.name} />)}
                        </Select>
                        <Select
                            id="user-role"
                            labelText="Role"
                            value={createForm.data.role}
                            onChange={e => createForm.setData('role', e.target.value)}
                        >
                            <SelectItem value="user" text="User" />
                            <SelectItem value="executive" text="Executive" />
                            <SelectItem value="admin" text="Admin" />
                        </Select>
                        <Select
                            id="user-approval"
                            labelText="Approval Position"
                            value={createForm.data.approval_position}
                            onChange={e => createForm.setData('approval_position', e.target.value)}
                        >
                            <SelectItem value="" text="No Approval Role" />
                            <SelectItem value="it_manager" text="IT Manager" />
                            <SelectItem value="finance_operations" text="Finance Operations" />
                            <SelectItem value="it_head" text="IT Head of Technology" />
                            <SelectItem value="finance_director" text="Finance Director" />
                        </Select>
                        <div style={{ gridColumn: '1 / -1', color: 'var(--cds-text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                            An invitation email will be sent to this address. The user will set their own password and then land on the dashboard assigned to their role.
                        </div>
                    </div>
                    </ModalBody>
                    <ModalFooter
                        primaryButtonText={createForm.processing ? 'Sending…' : 'Send Invite'}
                        secondaryButtonText="Cancel"
                        onRequestSubmit={handleCreate}
                        primaryButtonDisabled={createForm.processing}
                    />
                </ComposedModal>

                <Table size="lg" useZebraStyles>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Name</TableHeader>
                            <TableHeader>Email</TableHeader>
                            <TableHeader>Department</TableHeader>
                            <TableHeader>Role</TableHeader>
                            <TableHeader>Approval Position</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Joined</TableHeader>
                            <TableHeader>Actions</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} style={{ textAlign: 'center', color: '#9ca3af' }}>No users found.</TableCell>
                            </TableRow>
                        )}
                        {users.map(user => (
                            <TableRow key={user.id}>
                                <TableCell><strong>{user.name}</strong></TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.department_name}</TableCell>
                                <TableCell>
                                    <Tag type={roleTagType(user.role)} size="sm">{user.role}</Tag>
                                </TableCell>
                                <TableCell>
                                    {user.approval_position
                                        ? <Tag type="blue" size="sm">{approvalPositionLabel(user.approval_position)}</Tag>
                                        : <span style={{ color: '#9ca3af' }}>—</span>
                                    }
                                </TableCell>
                                <TableCell>
                                    <Tag type={user.is_active ? 'green' : 'red'} size="sm">
                                        {user.is_active ? 'Active' : 'Disabled'}
                                    </Tag>
                                </TableCell>
                                <TableCell>{user.created_at}</TableCell>
                                <TableCell>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button kind="ghost" size="sm" renderIcon={Edit} iconDescription="Edit" onClick={() => handleEdit(user)} hasIconOnly />
                                        {user.id !== auth.user.id && (
                                            <>
                                                <Button
                                                    kind="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleActive(user.id)}
                                                    title={user.is_active ? 'Disable' : 'Enable'}
                                                >
                                                    {user.is_active ? 'Disable' : 'Enable'}
                                                </Button>
                                                <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} iconDescription="Delete" onClick={() => handleDelete(user.id)} hasIconOnly />
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Edit user modal */}
                <ComposedModal
                    open={!!editing}
                    onClose={() => setEditing(null)}
                >
                    <ModalHeader title="Edit User" />
                    <ModalBody>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem' }}>
                        <TextInput
                            id="edit-name"
                            labelText="Full Name"
                            autoFocus
                            value={editForm.data.name}
                            onChange={e => editForm.setData('name', e.target.value)}
                            required
                        />
                        <TextInput
                            id="edit-email"
                            labelText="Email"
                            type="email"
                            value={editForm.data.email}
                            onChange={e => editForm.setData('email', e.target.value)}
                            required
                        />
                        <Select
                            id="edit-department"
                            labelText="Department"
                            value={editForm.data.department_id}
                            onChange={e => editForm.setData('department_id', e.target.value)}
                            required
                        >
                            <SelectItem value="" text="Department" />
                            {departments.map(d => <SelectItem key={d.id} value={d.id} text={d.name} />)}
                        </Select>
                        <Select
                            id="edit-role"
                            labelText="Role"
                            value={editForm.data.role}
                            onChange={e => editForm.setData('role', e.target.value)}
                        >
                            <SelectItem value="user" text="User" />
                            <SelectItem value="executive" text="Executive" />
                            <SelectItem value="admin" text="Admin" />
                        </Select>
                        <Select
                            id="edit-approval"
                            labelText="Approval Position"
                            value={editForm.data.approval_position}
                            onChange={e => editForm.setData('approval_position', e.target.value)}
                        >
                            <SelectItem value="" text="No Approval Role" />
                            <SelectItem value="it_manager" text="IT Manager" />
                            <SelectItem value="finance_operations" text="Finance Operations" />
                            <SelectItem value="it_head" text="IT Head of Technology" />
                            <SelectItem value="finance_director" text="Finance Director" />
                        </Select>
                    </div>
                    </ModalBody>
                    <ModalFooter
                        primaryButtonText={editForm.processing ? 'Saving…' : 'Save'}
                        secondaryButtonText="Cancel"
                        onRequestSubmit={(e) => handleUpdate(e, editing)}
                        primaryButtonDisabled={editForm.processing}
                    />
                </ComposedModal>

                {/* Delete confirmation */}
                <Modal
                    open={confirmOpen}
                    danger
                    modalHeading="Delete User"
                    primaryButtonText="Delete"
                    secondaryButtonText="Cancel"
                    onRequestClose={() => { setConfirmOpen(false); setConfirmTarget(null); }}
                    onRequestSubmit={confirmDelete}
                >
                    <p>Are you sure you want to delete this user?</p>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
