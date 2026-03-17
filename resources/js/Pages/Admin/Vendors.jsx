import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Vendors({ auth, vendors, flash }) {
    const [editing, setEditing] = useState(null);
    const [showCreate, setShowCreate] = useState(false);

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

    const handleEdit = (vendor) => {
        setEditing(vendor.id);
        editForm.setData({
            name: vendor.name, product_category: vendor.product_category,
            business_unit: vendor.business_unit || '', owner: vendor.owner || '',
            contact_email: vendor.contact_email,
        });
    };

    const handleUpdate = (e, id) => {
        e.preventDefault();
        editForm.put(route('admin.vendors.update', id), {
            onSuccess: () => setEditing(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this vendor?')) {
            router.delete(route('admin.vendors.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-2xl font-bold text-gray-800">Vendor Management</h2>}>
            <Head title="Vendors" />
            <div className="p-6 space-y-6">
                {flash?.success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{flash.success}</div>}

                <div className="flex justify-end">
                    <button onClick={() => setShowCreate(!showCreate)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        + Add Vendor
                    </button>
                </div>

                {showCreate && (
                    <form onSubmit={handleCreate} className="bg-gray-50 border border-gray-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Vendor Name *" value={createForm.data.name} onChange={e => createForm.setData('name', e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" required />
                        <input type="text" placeholder="Product Category *" value={createForm.data.product_category} onChange={e => createForm.setData('product_category', e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" required />
                        <input type="email" placeholder="Contact Email *" value={createForm.data.contact_email} onChange={e => createForm.setData('contact_email', e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" required />
                        <input type="text" placeholder="Business Unit" value={createForm.data.business_unit} onChange={e => createForm.setData('business_unit', e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        <input type="text" placeholder="Owner" value={createForm.data.owner} onChange={e => createForm.setData('owner', e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        <div className="flex items-end gap-2">
                            <button type="submit" disabled={createForm.processing} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50">Save</button>
                            <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300">Cancel</button>
                        </div>
                    </form>
                )}

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Business Unit</th>
                                <th className="px-4 py-3">Owner</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {vendors.length === 0 && (
                                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No vendors found. Add one above.</td></tr>
                            )}
                            {vendors.map(vendor => (
                                <tr key={vendor.id} className="hover:bg-gray-50">
                                    {editing === vendor.id ? (
                                        <td colSpan="6" className="px-4 py-3">
                                            <form onSubmit={(e) => handleUpdate(e, vendor.id)} className="grid grid-cols-6 gap-2 items-center">
                                                <input type="text" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" required />
                                                <input type="text" value={editForm.data.product_category} onChange={e => editForm.setData('product_category', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" required />
                                                <input type="email" value={editForm.data.contact_email} onChange={e => editForm.setData('contact_email', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" required />
                                                <input type="text" value={editForm.data.business_unit} onChange={e => editForm.setData('business_unit', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
                                                <input type="text" value={editForm.data.owner} onChange={e => editForm.setData('owner', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm" />
                                                <div className="flex gap-1 justify-end">
                                                    <button type="submit" className="text-green-600 hover:text-green-800 font-medium text-xs">Save</button>
                                                    <button type="button" onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700 font-medium text-xs">Cancel</button>
                                                </div>
                                            </form>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3 font-medium text-gray-900">{vendor.name}</td>
                                            <td className="px-4 py-3 text-gray-600">{vendor.product_category}</td>
                                            <td className="px-4 py-3 text-gray-600">{vendor.contact_email}</td>
                                            <td className="px-4 py-3 text-gray-600">{vendor.business_unit || '-'}</td>
                                            <td className="px-4 py-3 text-gray-600">{vendor.owner || '-'}</td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <button onClick={() => handleEdit(vendor)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                                <button onClick={() => handleDelete(vendor.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
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
