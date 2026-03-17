import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function MaintenanceReport({ auth, records, totalCost, avgCost, mostRepaired }) {
    const typeBadge = (type) => {
        const colors = {
            Preventive: 'bg-blue-100 text-blue-700',
            Corrective: 'bg-yellow-100 text-yellow-700',
            Emergency: 'bg-red-100 text-red-700',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-2xl font-bold text-gray-800">Maintenance Report</h2>}>
            <Head title="Maintenance Report" />
            <div className="p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Total Maintenance Cost</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">${totalCost.toLocaleString()}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Average Cost per Record</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">${avgCost.toLocaleString()}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Total Records</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{records.length}</div>
                    </div>
                </div>

                {/* Most Repaired Assets */}
                {mostRepaired.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Most Frequently Repaired Assets</h3>
                        <div className="space-y-2">
                            {mostRepaired.map((item, i) => (
                                <div key={item.asset_id} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700">
                                        <span className="font-medium text-gray-900 mr-2">#{i + 1}</span>
                                        {item.asset?.name || `Asset #${item.asset_id}`}
                                    </span>
                                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">{item.cnt} repairs</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Records Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Asset</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Issue</th>
                                <th className="px-4 py-3">Vendor</th>
                                <th className="px-4 py-3">Cost</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Start</th>
                                <th className="px-4 py-3">End</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {records.length === 0 && (
                                <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">No maintenance records found.</td></tr>
                            )}
                            {records.map(r => (
                                <tr key={r.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{r.asset?.name}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge(r.maintenance_type)}`}>
                                            {r.maintenance_type || 'Corrective'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{r.issue_description}</td>
                                    <td className="px-4 py-3 text-gray-600">{r.vendor_name || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{r.cost ? `$${Number(r.cost).toFixed(2)}` : '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{r.start_date}</td>
                                    <td className="px-4 py-3 text-gray-600">{r.end_date || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
