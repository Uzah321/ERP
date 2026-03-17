import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function DecommissionLog({ auth, assets }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Decommission Log" />

            <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden text-sm">
                <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        <h1 className="text-xl font-bold text-gray-800">Decommission Log</h1>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-hidden flex flex-col">
                    <div className="bg-white flex-1 border border-gray-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
                        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex justify-between items-center shrink-0 cursor-default">
                            <h2 className="text-gray-800 font-semibold text-base">Decommissioned Assets</h2>
                            <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{assets.length} items</span>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-left whitespace-nowrap border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Barcode / Serial</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Asset Info</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Department & Location</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-gray-500">
                                                No decommissioned assets found.
                                            </td>
                                        </tr>
                                    ) : (
                                        assets.map((asset) => (
                                            <tr key={asset.id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors bg-white">
                                                <td className="px-5 py-3 font-mono text-gray-600 text-xs">
                                                    <div className="font-semibold text-gray-800">{asset.barcode}</div>
                                                    {asset.serial_number && <div>{asset.serial_number}</div>}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="font-medium text-gray-900">{asset.name}</div>
                                                    <div className="text-xs text-gray-500">{asset.category?.name || 'Uncategorized'}</div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="text-gray-800">{asset.department?.name || '-'}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        {asset.location?.name || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <span className="bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium">
                                                        Decommissioned
                                                    </span>
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

