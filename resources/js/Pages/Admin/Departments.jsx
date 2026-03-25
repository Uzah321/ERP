import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

function DeptModal({ title, form, onSubmit, onClose, users }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Department Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={e => form.setData('name', e.target.value)}
                            placeholder="e.g. Finance, IT, Operations"
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                            required autoFocus
                        />
                        {form.errors.name && <p className="text-red-500 text-xs mt-1">{form.errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Department Manager</label>
                        <select
                            value={form.data.manager_id}
                            onChange={e => form.setData('manager_id', e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white"
                        >
                            <option value="">— No Manager —</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={form.processing}
                            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2">
                            {form.processing && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
                            Save Department
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Departments({ auth, departments, users, flash }) {
    const [modal, setModal] = useState(null); // null | 'create' | dept object

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
        if (confirm(`Delete "${dept.name}"? Departments with users or assets cannot be deleted.`)) {
            router.delete(route('admin.departments.destroy', dept.id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Department Management" />

            <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden text-sm">

                {/* Page header bar */}
                <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm shrink-0 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-800">Department Management</h1>
                            <p className="text-xs text-gray-400">{departments.length} department{departments.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <button onClick={openCreate}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                        Add Department
                    </button>
                </div>

                <div className="flex-1 p-6 overflow-hidden flex flex-col">

                    {/* Flash messages */}
                    {flash?.success && (
                        <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                            {flash.success}
                        </div>
                    )}
                    {flash?.errors?.department && (
                        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                            {flash.errors.department}
                        </div>
                    )}

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        {[
                            { label: 'Total Departments', value: departments.length, color: 'blue' },
                            { label: 'Total Users', value: departments.reduce((s, d) => s + (d.users_count ?? 0), 0), color: 'indigo' },
                            { label: 'Total Assets', value: departments.reduce((s, d) => s + (d.assets_count ?? 0), 0), color: 'green' },
                        ].map(stat => (
                            <div key={stat.label} className={`bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm`}>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</p>
                                <p className={`text-2xl font-bold text-${stat.color}-600 mt-1`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden shadow-sm flex-1">
                        <div className="overflow-auto custom-scrollbar">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-200">Department</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-200">Manager</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-200 text-center">Users</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-200 text-center">Assets</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs border-b border-gray-200 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departments.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-5 py-16 text-center text-gray-400">
                                                <svg className="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/></svg>
                                                No departments yet. Click <strong>Add Department</strong> to get started.
                                            </td>
                                        </tr>
                                    ) : departments.map(dept => (
                                        <tr key={dept.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                                                        {dept.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{dept.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-600">
                                                {dept.manager?.name
                                                    ? <span className="flex items-center gap-1.5">
                                                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold">{dept.manager.name.charAt(0)}</div>
                                                        {dept.manager.name}
                                                      </span>
                                                    : <span className="text-gray-300 italic">Unassigned</span>
                                                }
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">{dept.users_count}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">{dept.assets_count}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => openEdit(dept)}
                                                        className="p-1.5 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(dept)}
                                                        className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create modal */}
            {modal === 'create' && (
                <DeptModal title="Add New Department" form={createForm} onSubmit={handleCreate} onClose={closeModal} users={users} />
            )}

            {/* Edit modal */}
            {modal && modal !== 'create' && (
                <DeptModal title={`Edit — ${modal.name}`} form={editForm} onSubmit={handleUpdate} onClose={closeModal} users={users} />
            )}
        </AuthenticatedLayout>
    );
}
