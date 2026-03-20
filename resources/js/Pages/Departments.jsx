import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';

export default function Departments() {
    const { departments, errors } = usePage().props;
    const [name, setName] = useState('');
    const [editing, setEditing] = useState(null);
    const [editName, setEditName] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        router.post(route('departments.store'), { name });
    };

    const handleEdit = (id, currentName) => {
        setEditing(id);
        setEditName(currentName);
    };

    const handleUpdate = (id) => {
        router.put(route('departments.update', id), { name: editName });
        setEditing(null);
    };

    const handleDelete = (id) => {
        if (confirm('Delete this department?')) {
            router.delete(route('departments.destroy', id));
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Manage Departments</h1>
            <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                <input
                    type="text"
                    className="border rounded px-3 py-2 flex-1"
                    placeholder="Department name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
            </form>
            {errors && errors.name && (
                <div className="text-red-600 mb-2">{errors.name}</div>
            )}
            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {departments.map(dep => (
                        <tr key={dep.id} className="border-t">
                            <td className="p-2">
                                {editing === dep.id ? (
                                    <input
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="border rounded px-2 py-1"
                                    />
                                ) : (
                                    dep.name
                                )}
                            </td>
                            <td className="p-2 flex gap-2">
                                {editing === dep.id ? (
                                    <>
                                        <button onClick={() => handleUpdate(dep.id)} className="bg-green-600 text-white px-2 py-1 rounded">Save</button>
                                        <button onClick={() => setEditing(null)} className="bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEdit(dep.id, dep.name)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                                        <button onClick={() => handleDelete(dep.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
