import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function ReportsIndex({ auth, flash }) {
    const [filters, setFilters] = useState({ department_id: '', status: '', date_from: '', date_to: '' });

    const buildQueryString = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
        return params.toString();
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-2xl font-bold text-gray-800">Reports & Export</h2>}>
            <Head title="Reports" />
            <div className="p-6 space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter Assets</h3>
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                                <option value="">All Statuses</option>
                                {['Available', 'Allocated', 'Under Maintenance', 'Retired', 'Purchased', 'Active Use', 'Decommissioned', 'Disposed'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
                            <input type="date" value={filters.date_from} onChange={e => setFilters({...filters, date_from: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
                            <input type="date" value={filters.date_to} onChange={e => setFilters({...filters, date_to: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <a href={`${route('reports.assets')}?${buildQueryString()}`} className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="font-semibold text-gray-900">Asset Report (PDF)</h3>
                        <p className="text-xs text-gray-500 mt-1">Download filtered asset register as PDF</p>
                    </a>

                    <a href={`${route('reports.assets.csv')}?${buildQueryString()}`} className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                        </div>
                        <h3 className="font-semibold text-gray-900">Asset Report (CSV)</h3>
                        <p className="text-xs text-gray-500 mt-1">Export filtered data for Excel/Google Sheets</p>
                    </a>

                    <a href={route('reports.maintenance')} className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <h3 className="font-semibold text-gray-900">Maintenance Report</h3>
                        <p className="text-xs text-gray-500 mt-1">Cost analysis and repair frequency</p>
                    </a>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
