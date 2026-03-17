import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function DisposalLog({ auth, disposals }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Disposal Certificates" />

            <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden text-sm">
                <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        <h1 className="text-xl font-bold text-gray-800">Disposal Log</h1>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-hidden flex flex-col">
                    <div className="bg-white flex-1 border border-gray-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
                        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex justify-between items-center shrink-0 cursor-default">
                            <h2 className="text-gray-800 font-semibold text-base">Asset Disposals</h2>
                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{disposals.length} records</span>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-left whitespace-nowrap border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Date</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Asset</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Method</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Reason</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Recovery Val.</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Authorized By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {disposals.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-8 text-center text-gray-500">
                                                No disposed assets found.
                                            </td>
                                        </tr>
                                    ) : (
                                        disposals.map((log) => (
                                            <tr key={log.id} className="hover:bg-red-50 border-b border-gray-100 transition-colors bg-white">
                                                <td className="px-5 py-3 text-gray-600 font-mono text-xs">{log.created_at}</td>
                                                <td className="px-5 py-3">
                                                    <div className="font-medium text-gray-900">{log.asset_name}</div>
                                                    <div className="text-xs text-gray-500">{log.asset_barcode}</div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                                                        {log.method}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-gray-600 whitespace-normal min-w-[200px]">{log.reason}</td>
                                                <td className="px-5 py-3 font-mono text-green-700">
                                                    ${parseFloat(log.recovery_amount || 0).toFixed(2)}
                                                </td>
                                                <td className="px-5 py-3 text-gray-800">{log.user_name}</td>
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

