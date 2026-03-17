import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ActivityLogIndex({ auth, logs }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Asset Activity Log" />

            <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden text-sm">
                <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <h1 className="text-xl font-bold text-gray-800">Asset Activity Log</h1>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-hidden flex flex-col">
                    <div className="bg-white flex-1 border border-gray-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
                        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex justify-between items-center shrink-0 cursor-default">
                            <h2 className="text-gray-800 font-semibold text-base">System Activity</h2>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{logs.length} records</span>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-left whitespace-nowrap border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Date / Time</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Causer</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Action / Description</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Target Entity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-gray-500">
                                                No activity logs found.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-blue-50 border-b border-gray-100 transition-colors bg-white">
                                                <td className="px-5 py-3 text-gray-600 font-mono text-xs">{log.created_at}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">{log.causer}</span>
                                                        {log.causer_email && <span className="text-xs text-gray-500">{log.causer_email}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-gray-800">
                                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium mr-2">
                                                        {log.event || 'ACTION'}
                                                    </span>
                                                    {log.description}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-gray-500 uppercase font-semibold">{log.subject_type || '-'}</span>
                                                        <span className="font-medium text-gray-800">{log.subject_name}</span>
                                                    </div>
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

