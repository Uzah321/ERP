import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function MaintenanceIndex({ auth, assets }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Maintenance & Repair History</h2>}
        >
            <Head title="Maintenance Tracking" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Asset Maintenance Tracking</h3>
                                <p className="text-sm text-slate-500 mt-1">Review the time in use and repair frequency for all assets.</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Asset</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Status & Condition</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200">Time in Use</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200 text-center">Times Repaired</th>
                                        <th className="px-6 py-4 font-medium border-b border-slate-200 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {assets.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                                No assets found in the system.
                                            </td>
                                        </tr>
                                    ) : (
                                        assets.map(asset => (
                                            <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900">{asset.name}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">SN: {asset.serial_number || 'N/A'} • {asset.barcode}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium mr-2 ${
                                                        asset.status === 'Active Use' ? 'bg-green-100 text-green-700' :
                                                        asset.status === 'Available' ? 'bg-green-100 text-green-700' :
                                                        asset.status === 'Allocated' ? 'bg-indigo-100 text-indigo-700' :
                                                        asset.status === 'Deployed' ? 'bg-emerald-100 text-emerald-700' :
                                                        asset.status === 'Purchased' ? 'bg-purple-100 text-purple-700' :
                                                        asset.status === 'Registered' ? 'bg-blue-100 text-blue-700' :
                                                        asset.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-700' :
                                                        asset.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-700' :
                                                        asset.status === 'Audit' ? 'bg-orange-100 text-orange-700' :
                                                        asset.status === 'Retired' ? 'bg-gray-300 text-gray-800' :
                                                        asset.status === 'Decommissioned' ? 'bg-gray-200 text-gray-700' :
                                                        asset.status === 'Disposed' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {asset.status}
                                                    </span>
                                                    <span className="text-sm text-slate-600">{asset.condition}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center text-slate-700 font-medium border border-slate-200 bg-slate-50 w-max px-3 py-1 rounded-lg">
                                                        <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {asset.time_in_use}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="inline-flex items-center justify-center min-w-[2.5rem] h-8 px-3 rounded-full bg-blue-50 text-blue-700 font-bold text-sm">
                                                        {asset.repair_count}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={route('maintenance.show', asset.id)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">View History</Link>
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