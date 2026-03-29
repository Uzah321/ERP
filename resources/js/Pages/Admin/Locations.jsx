import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Locations({ auth, locations, flash }) {
    const [modal, setModal] = useState(null);

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
        if (confirm(`Delete location "${loc.name}"? Locations with assigned assets cannot be deleted.`)) {
            router.delete(route('admin.locations.destroy', loc.id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Asset Locations" />

            <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden text-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Manage Locations</h2>
                    <button onClick={openCreate} className="bg-purple-600 text-white px-4 py-2 rounded shadow">+ New Location</button>
                </div>

                {flash?.success && <div className="mb-4 bg-green-100 text-green-700 p-3 rounded">{flash.success}</div>}
                {Object.keys(errors).length > 0 && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">{Object.values(errors)[0]}</div>}

                <div className="bg-white rounded shadow text-left overflow-auto">
                    <table className="w-full">
                        <thead className="bg-slate-100/50">
                            <tr>
                                <th className="p-4 border-b">Name</th>
                                <th className="p-4 border-b">Address / Details</th>
                                <th className="p-4 w-24 border-b text-center">Assets</th>
                                <th className="p-4 w-24 border-b text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locations.map(loc => (
                                <tr key={loc.id} className="border-b">
                                    <td className="p-4 font-semibold">{loc.name}</td>
                                    <td className="p-4 text-slate-500">{loc.address || '-'}</td>
                                    <td className="p-4 text-center">{loc.assets_count || 0}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => openEdit(loc)} className="text-blue-500 hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(loc)} className="text-red-500 hover:underline hover:text-red-700 ml-2">Del</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {modal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                        <div className="bg-white p-6 rounded shadow-xl w-96">
                            <h3 className="font-bold mb-4">{modal === 'create' ? 'New' : 'Edit'} Location</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div><input className="w-full border p-2 rounded" placeholder="Location Name" value={data.name} onChange={e => setData('name', e.target.value)} required /></div>
                                <div><textarea className="w-full border p-2 rounded" placeholder="Address / Description" value={data.address} onChange={e => setData('address', e.target.value)} /></div>
                                <div className="flex justify-end space-x-2">
                                    <button type="button" onClick={closeModal} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                                    <button type="submit" disabled={processing} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
