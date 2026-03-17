import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function DepartmentRollup({ auth, rollups }) {
    const totalAssets = rollups.reduce((sum, r) => sum + r.asset_count, 0);
    const totalValue = rollups.reduce((sum, r) => sum + parseFloat(r.total_value), 0);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Department Rollup" />

            <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden text-sm">
                <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <h1 className="text-xl font-bold text-gray-800">Department Rollup</h1>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-hidden flex flex-col">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Assets</p>
                                <p className="text-2xl font-bold text-gray-800">{totalAssets}</p>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Estimated Value</p>
                                <p className="text-2xl font-bold text-gray-800">${totalValue.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white flex-1 border border-gray-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
                        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex justify-between items-center shrink-0 cursor-default">
                            <h2 className="text-gray-800 font-semibold text-base">Department Summary</h2>
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{rollups.length} departments</span>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-left whitespace-nowrap border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Department Name</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs text-center">Active Assets</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs text-right">Total Depreciated Value</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs text-center">Utilization</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rollups.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-gray-500">
                                                No departments found.
                                            </td>
                                        </tr>
                                    ) : (
                                        rollups.map((dept) => {
                                            const percentage = totalAssets > 0 ? ((dept.asset_count / totalAssets) * 100).toFixed(1) : 0;
                                            return (
                                                <tr key={dept.id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors bg-white">
                                                    <td className="px-5 py-3 font-medium text-gray-900">{dept.name}</td>
                                                    <td className="px-5 py-3 text-center">
                                                        <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-semibold text-xs text-center">
                                                            {dept.asset_count}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-right font-mono font-medium text-green-700">
                                                        ${parseFloat(dept.total_value).toLocaleString()}
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-3 justify-center">
                                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                                            </div>
                                                            <span className="text-xs text-gray-500 w-8">{percentage}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
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

