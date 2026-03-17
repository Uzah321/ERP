import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ArchiveUtilities({ auth, archivedAssets }) {
    const handleRestore = (id) => {
        if (confirm('Are you sure you want to restore this asset back to active inventory?')) {
            router.post(route('archive.restore', id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Archive Utilities" />

            <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden text-sm">
                <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                        <h1 className="text-xl font-bold text-gray-800">Archive Utilities</h1>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-hidden flex flex-col">
                    <div className="bg-white flex-1 border border-gray-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
                        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex justify-between items-center shrink-0 cursor-default">
                            <h2 className="text-gray-800 font-semibold text-base">Archived Assets</h2>
                            <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{archivedAssets.length} items</span>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-left whitespace-nowrap border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Deleted At</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Asset</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Category / Location</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {archivedAssets.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-gray-500">
                                                No archived assets found.
                                            </td>
                                        </tr>
                                    ) : (
                                        archivedAssets.map((asset) => (
                                            <tr key={asset.id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors bg-white">
                                                <td className="px-5 py-3 text-gray-600 font-mono text-xs">{new Date(asset.deleted_at).toLocaleString()}</td>
                                                <td className="px-5 py-3">
                                                    <div className="font-medium text-gray-900">{asset.name}</div>
                                                    <div className="text-xs text-gray-500">{asset.barcode}</div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="text-gray-800">{asset.category?.name || '-'}</div>
                                                    <div className="text-xs text-gray-500">{asset.location?.name || '-'}</div>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <button onClick={() => handleRestore(asset.id)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium transition-colors">
                                                        Restore Data
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

