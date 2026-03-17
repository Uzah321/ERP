import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Users({ auth, users, departments, flash }) {
    const [editing, setEditing] = useState(null);
    const [showCreate, setShowCreate] = useState(false);

    const createForm = useForm({
        name: '', email: '', password: '', department_id: '', role: 'user',
    });

    const editForm = useForm({
        name: '', email: '', department_id: '', role: 'user',
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
        });
    };

    const handleUpdate = (e, id) => {
        e.preventDefault();
        editForm.put(route('admin.users.update', id), {
            onSuccess: () => setEditing(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('admin.users.destroy', id));
        }
    };

    const handleToggleActive = (id) => {
        router.patch(route('admin.users.toggle', id));
    };

    const roleBadge = (role) => {
        const styles = role === 'admin'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-gray-100 text-gray-700';
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>{role}</span>;
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-2xl font-bold text-gray-800">User Management</h2>}>
            <Head title="Users" />
            <div className="p-6 space-y-6">
                {flash?.success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{flash.success}</div>}

                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">{users.length} user(s) registered</p>
                    <button onClick={() => setShowCreate(!showCreate)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        + Add User
                    </button>
                </div>

                {showCreate && (
                    <form onSubmit={handleCreate} className="bg-gray-50 border border-gray-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Full Name *" value={createForm.data.name} onChange={e => createForm.setData('name', e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" required />
                        <input type="email" placeholder="Email *" value={createForm.data.email} onChange={e => createForm.setData('email', e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" required />
                        <input type="password" placeholder="Password *" value={createForm.data.password} onChange={e => createForm.setData('password', e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" required />
                        <select value={createForm.data.department_id} onChange={e => createForm.setData('department_id', e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" required>
                            <option value="">Select Department *</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <select value={createForm.data.role} onChange={e => createForm.setData('role', e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <div className="flex items-end gap-2">
                            <button type="submit" disabled={createForm.processing} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50">Create</button>
                            <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300">Cancel</button>
                        </div>
                        {createForm.errors.email && <p className="text-red-500 text-xs col-span-3">{createForm.errors.email}</p>}
                        {createForm.errors.password && <p className="text-red-500 text-xs col-span-3">{createForm.errors.password}</p>}
                    </form>
                )}

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Department</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Joined</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.length === 0 && (
                                <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">No users found.</td></tr>
                            )}
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    {editing === user.id ? (
                                        <td colSpan="7" className="px-4 py-3">
                                            <form onSubmit={(e) => handleUpdate(e, user.id)} className="grid grid-cols-6 gap-2 items-center">
                                                <input type="text" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" required />
                                                <input type="email" value={editForm.data.email} onChange={e => editForm.setData('email', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" required />
                                                <select value={editForm.data.department_id} onChange={e => editForm.setData('department_id', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" required>
                                                    <option value="">Department</option>
                                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                </select>
                                                <select value={editForm.data.role} onChange={e => editForm.setData('role', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm">
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <div></div>
                                                <div className="flex gap-1 justify-end">
                                                    <button type="submit" className="text-green-600 hover:text-green-800 font-medium text-xs">Save</button>
                                                    <button type="button" onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700 font-medium text-xs">Cancel</button>
                                                </div>
                                            </form>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                                            <td className="px-4 py-3 text-gray-600">{user.email}</td>
                                            <td className="px-4 py-3 text-gray-600">{user.department_name}</td>
                                            <td className="px-4 py-3">{roleBadge(user.role)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {user.is_active ? 'Active' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">{user.created_at}</td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                                {user.id !== auth.user.id && (
                                                    <>
                                                        <button onClick={() => handleToggleActive(user.id)} className={`text-xs font-medium ${user.is_active ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}>
                                                            {user.is_active ? 'Disable' : 'Enable'}
                                                        </button>
                                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                                                    </>
                                                )}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
