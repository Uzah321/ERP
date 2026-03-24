import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const fmt = (n) => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusBadge = (status) => {
    const map = {
        approved: 'bg-green-100 text-green-700',
        declined: 'bg-red-100 text-red-700',
        pending:  'bg-yellow-100 text-yellow-700',
    };
    const key = status === 'approved' ? 'approved' : status === 'declined' ? 'declined' : 'pending';
    return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${map[key]}`}>{status}</span>;
};

export default function BudgetTracking({ auth, rows, summary, byDepartment, departments, filters }) {
    const [departmentId, setDepartmentId] = useState(filters.department_id || '');
    const [year, setYear]                 = useState(filters.year || new Date().getFullYear());

    const applyFilters = () => {
        router.get(route('admin.budget-tracking'), { department_id: departmentId, year }, { preserveState: true });
    };

    const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Budget vs Actual Tracking" />

            <div className="p-6 space-y-6 overflow-auto h-full">
                {/* Page Title */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Budget vs. Actual Tracking</h1>
                        <p className="text-sm text-gray-500 mt-1">Compare CAPEX budgets against Purchase Orders and invoiced amounts per department.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</label>
                        <select
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
                            value={departmentId}
                            onChange={e => setDepartmentId(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Year</label>
                        <select
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={year}
                            onChange={e => setYear(e.target.value)}
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={applyFilters}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                        Apply Filters
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Budgeted (CAPEX)', value: summary.total_budgeted, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                        { label: 'Total PO Amount',        value: summary.total_po,       color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
                        { label: 'Total Invoiced',         value: summary.total_invoiced,  color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                        { label: 'Total Variance',         value: summary.total_variance,  color: summary.total_variance >= 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700' },
                    ].map(card => (
                        <div key={card.label} className={`rounded-xl border p-5 ${card.color}`}>
                            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{card.label}</p>
                            <p className="text-2xl font-bold mt-2">{fmt(card.value)}</p>
                        </div>
                    ))}
                </div>

                {/* Bar Chart — by Department */}
                {byDepartment.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-base font-bold text-gray-800 mb-4">By Department</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={byDepartment} margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                                    <YAxis tickFormatter={v => '$' + (v / 1000).toFixed(0) + 'k'} tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(v) => fmt(v)} />
                                    <Legend />
                                    <Bar dataKey="total_budgeted" name="Budgeted"  fill="#3b82f6" radius={[4,4,0,0]} />
                                    <Bar dataKey="total_po"       name="PO Amount" fill="#6366f1" radius={[4,4,0,0]} />
                                    <Bar dataKey="total_invoiced" name="Invoiced"  fill="#10b981" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Detail Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex justify-between items-center">
                        <h2 className="text-sm font-semibold text-gray-700">CAPEX Budget Detail</h2>
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">{rows.length} records</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {['RTP Reference','Department','Requested By','Status','Budgeted','PO Amount','Invoiced','Variance','Date'].map(h => (
                                        <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                                            No CAPEX records found for the selected filters.
                                        </td>
                                    </tr>
                                ) : rows.map(row => {
                                    const over = row.variance < 0;
                                    return (
                                        <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-blue-700 font-semibold text-xs">{row.rtp_reference}</td>
                                            <td className="px-4 py-3 text-gray-700">{row.department}</td>
                                            <td className="px-4 py-3 text-gray-600">{row.requested_by}</td>
                                            <td className="px-4 py-3">{statusBadge(row.status)}</td>
                                            <td className="px-4 py-3 font-semibold text-gray-800">{fmt(row.budgeted)}</td>
                                            <td className="px-4 py-3 text-indigo-700">
                                                {row.po_number
                                                    ? <>{fmt(row.po_amount)} <span className="text-xs text-gray-400 ml-1">PO#{row.po_number}</span></>
                                                    : <span className="text-gray-400 text-xs">No PO yet</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-emerald-700">{row.invoiced > 0 ? fmt(row.invoiced) : <span className="text-gray-400 text-xs">—</span>}</td>
                                            <td className={`px-4 py-3 font-semibold ${over ? 'text-red-600' : 'text-green-600'}`}>
                                                {over ? '▼ ' : '▲ '}{fmt(Math.abs(row.variance))}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{row.created_at}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
