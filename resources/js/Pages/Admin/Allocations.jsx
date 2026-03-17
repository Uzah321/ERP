import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Allocations({ auth, allocations, assets, departments, users, flash }) {
    const [showCreate, setShowCreate] = useState(false);

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
        if (confirm('Mark this asset as returned?')) {
            router.patch(route('admin.allocations.return', id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-2xl font-bold text-gray-800">Asset Allocations</h2>}>
            <Head title="Asset Allocations" />
            <div className="p-6 space-y-6">
                {flash?.success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{flash.success}</div>}

                <div className="flex justify-end">
                    <button onClick={() => setShowCreate(!showCreate)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        + Allocate Asset
                    </button>
                </div>

                {showCreate && (
                    <form onSubmit={handleCreate} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Asset *</label>
                                <select value={form.data.asset_id} onChange={e => form.setData('asset_id', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" required>
                                    <option value="">— Select Asset —</option>
                                    {assets.filter(a => a.status === 'Available' || a.status === 'Active' || a.status === 'Purchased' || a.status === 'Registered').map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.barcode})</option>
                                    ))}
                                </select>
                                {form.errors.asset_id && <p className="text-red-500 text-xs mt-1">{form.errors.asset_id}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Allocated Date *</label>
                                <input type="date" value={form.data.allocated_date} onChange={e => form.setData('allocated_date', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                                <select value={form.data.department_id} onChange={e => form.setData('department_id', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                                    <option value="">— Select Department —</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Assign to User</label>
                                <select value={form.data.user_id} onChange={e => form.setData('user_id', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                                    <option value="">— Select User —</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                            <textarea value={form.data.notes} onChange={e => form.setData('notes', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" rows="2" />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300">Cancel</button>
                            <button type="submit" disabled={form.processing} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50">Allocate</button>
                        </div>
                    </form>
                )}

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Asset</th>
                                <th className="px-4 py-3">Department</th>
                                <th className="px-4 py-3">Assigned To</th>
                                <th className="px-4 py-3">Allocated By</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {allocations.length === 0 && (
                                <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">No allocations found.</td></tr>
                            )}
                            {allocations.map(a => (
                                <tr key={a.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">{a.asset?.name}</div>
                                        <div className="text-xs text-gray-500">{a.asset?.barcode}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{a.department?.name || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{a.user?.name || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{a.allocator?.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{a.allocated_date}</td>
                                    <td className="px-4 py-3">
                                        {a.returned_date ? (
                                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">Returned {a.returned_date}</span>
                                        ) : (
                                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">Active</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {!a.returned_date && (
                                            <button onClick={() => handleReturn(a.id)} className="text-orange-600 hover:text-orange-800 text-xs font-medium">Return</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
