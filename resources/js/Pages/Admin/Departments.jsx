import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Departments({ auth, departments, users, flash }) {
    const [editing, setEditing] = useState(null);
    const [showCreate, setShowCreate] = useState(false);

    const createForm = useForm({ name: '', manager_id: '' });
    const editForm = useForm({ name: '', manager_id: '' });

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('admin.departments.store'), {
            onSuccess: () => { createForm.reset(); setShowCreate(false); },
        });
    };

    const handleEdit = (dept) => {
        setEditing(dept.id);
        editForm.setData({ name: dept.name, manager_id: dept.manager_id || '' });
    };

    const handleUpdate = (e, id) => {
        e.preventDefault();
        editForm.put(route('admin.departments.update', id), {
            onSuccess: () => setEditing(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure? Departments with users or assets cannot be deleted.')) {
            router.delete(route('admin.departments.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-2xl font-bold text-gray-800">Department Management</h2>}>
            <Head title="Departments" />
            <div className="p-6 space-y-6">
                {flash?.success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{flash.success}</div>}
                {flash?.errors?.department && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{flash.errors.department}</div>}

                <div className="flex justify-end">
                    <button onClick={() => setShowCreate(!showCreate)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        + Add Department
                    </button>
                </div>

                {showCreate && (
                    <form onSubmit={handleCreate} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Department Name *</label>
                            <input type="text" placeholder="Department Name" value={createForm.data.name} onChange={e => createForm.setData('name', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" required />
                            {createForm.errors.name && <p className="text-red-500 text-xs mt-1">{createForm.errors.name}</p>}
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Manager</label>
                            <select value={createForm.data.manager_id} onChange={e => createForm.setData('manager_id', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                                <option value="">— No Manager —</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <button type="submit" disabled={createForm.processing} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50">Save</button>
                        <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300">Cancel</button>
                    </form>
                )}

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Department</th>
                                <th className="px-4 py-3">Manager</th>
                                <th className="px-4 py-3 text-center">Users</th>
                                <th className="px-4 py-3 text-center">Assets</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {departments.length === 0 && (
                                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No departments found.</td></tr>
                            )}
                            {departments.map(dept => (
                                <tr key={dept.id} className="hover:bg-gray-50">
                                    {editing === dept.id ? (
                                        <td colSpan="5" className="px-4 py-3">
                                            <form onSubmit={(e) => handleUpdate(e, dept.id)} className="flex gap-2 items-center">
                                                <input type="text" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm" required />
                                                <select value={editForm.data.manager_id} onChange={e => editForm.setData('manager_id', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm">
                                                    <option value="">— No Manager —</option>
                                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                                </select>
                                                <button type="submit" className="text-green-600 hover:text-green-800 font-medium text-xs">Save</button>
                                                <button type="button" onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700 font-medium text-xs">Cancel</button>
                                            </form>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3 font-medium text-gray-900">{dept.name}</td>
                                            <td className="px-4 py-3 text-gray-600">{dept.manager?.name || '—'}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">{dept.users_count}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">{dept.assets_count}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <button onClick={() => handleEdit(dept)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                                <button onClick={() => handleDelete(dept.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
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
