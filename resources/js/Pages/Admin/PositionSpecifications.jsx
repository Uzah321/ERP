import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function PositionSpecifications({ auth, specifications, flash }) {
    const [editing, setEditing] = useState(null);
    const [showCreate, setShowCreate] = useState(false);

    const createForm = useForm({ position_name: '', asset_type: '', specifications: '' });
    const editForm = useForm({ position_name: '', asset_type: '', specifications: '' });

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('admin.position-specs.store'), {
            onSuccess: () => { createForm.reset(); setShowCreate(false); },
        });
    };

    const handleEdit = (spec) => {
        setEditing(spec.id);
        editForm.setData({
            position_name: spec.position_name,
            asset_type: spec.asset_type,
            specifications: spec.specifications,
        });
    };

    const handleUpdate = (e, id) => {
        e.preventDefault();
        editForm.put(route('admin.position-specs.update', id), {
            onSuccess: () => setEditing(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this specification?')) {
            router.delete(route('admin.position-specs.destroy', id));
        }
    };

    // Group specifications by position for a nice display
    const grouped = specifications.reduce((acc, spec) => {
        if (!acc[spec.position_name]) acc[spec.position_name] = [];
        acc[spec.position_name].push(spec);
        return acc;
    }, {});

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-2xl font-bold text-gray-800">Position &amp; Asset Specifications</h2>}>
            <Head title="Position Specifications" />
            <div className="p-6 space-y-6">

                {flash?.success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{flash.success}</div>}

                {/* Explanation */}
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
                    <strong>How it works:</strong> Define what IT asset specifications each staff position should receive.
                    When users submit an asset request, the system will auto-fill the recommended specs based on the position and asset type selected.
                </div>

                <div className="flex justify-end">
                    <button onClick={() => setShowCreate(!showCreate)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        + Add Specification
                    </button>
                </div>

                {showCreate && (
                    <form onSubmit={handleCreate} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Position Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Manager, HOD, Staff, Intern"
                                    value={createForm.data.position_name}
                                    onChange={e => createForm.setData('position_name', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    required
                                />
                                {createForm.errors.position_name && <p className="text-red-500 text-xs mt-1">{createForm.errors.position_name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Asset Type *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Laptop, Desktop, Monitor"
                                    value={createForm.data.asset_type}
                                    onChange={e => createForm.setData('asset_type', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    required
                                />
                                {createForm.errors.asset_type && <p className="text-red-500 text-xs mt-1">{createForm.errors.asset_type}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Specifications *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 32GB+ RAM, 1TB+ storage, Core i7"
                                    value={createForm.data.specifications}
                                    onChange={e => createForm.setData('specifications', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    required
                                />
                                {createForm.errors.specifications && <p className="text-red-500 text-xs mt-1">{createForm.errors.specifications}</p>}
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button type="submit" disabled={createForm.processing} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50">Save</button>
                            <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300">Cancel</button>
                        </div>
                    </form>
                )}

                {/* Specifications Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Position</th>
                                <th className="px-4 py-3">Asset Type</th>
                                <th className="px-4 py-3">Specifications</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {specifications.length === 0 && (
                                <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-400">No position specifications defined yet. Click "+ Add Specification" to get started.</td></tr>
                            )}
                            {specifications.map(spec => (
                                <tr key={spec.id} className="hover:bg-gray-50">
                                    {editing === spec.id ? (
                                        <td colSpan="4" className="px-4 py-3">
                                            <form onSubmit={(e) => handleUpdate(e, spec.id)} className="flex gap-2 items-center flex-wrap">
                                                <input
                                                    type="text"
                                                    value={editForm.data.position_name}
                                                    onChange={e => editForm.setData('position_name', e.target.value)}
                                                    className="flex-1 min-w-[120px] border border-gray-300 rounded px-2 py-1 text-sm"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    value={editForm.data.asset_type}
                                                    onChange={e => editForm.setData('asset_type', e.target.value)}
                                                    className="flex-1 min-w-[120px] border border-gray-300 rounded px-2 py-1 text-sm"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    value={editForm.data.specifications}
                                                    onChange={e => editForm.setData('specifications', e.target.value)}
                                                    className="flex-1 min-w-[200px] border border-gray-300 rounded px-2 py-1 text-sm"
                                                    required
                                                />
                                                <button type="submit" className="text-green-600 hover:text-green-800 font-medium text-xs">Save</button>
                                                <button type="button" onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700 font-medium text-xs">Cancel</button>
                                            </form>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3 font-medium text-gray-900 capitalize">{spec.position_name}</td>
                                            <td className="px-4 py-3 text-gray-700">{spec.asset_type}</td>
                                            <td className="px-4 py-3 text-gray-600">{spec.specifications}</td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <button onClick={() => handleEdit(spec)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                                <button onClick={() => handleDelete(spec.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary by Position */}
                {Object.keys(grouped).length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Summary by Position</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(grouped).map(([position, specs]) => (
                                <div key={position} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <h4 className="font-semibold text-gray-900 capitalize mb-2 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        {position}
                                    </h4>
                                    <ul className="space-y-1 text-sm text-gray-600">
                                        {specs.map(s => (
                                            <li key={s.id} className="flex justify-between">
                                                <span className="text-gray-500">{s.asset_type}:</span>
                                                <span className="font-medium text-gray-700">{s.specifications}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
