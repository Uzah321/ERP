import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Tag } from '@carbon/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['var(--cds-interactive)', 'var(--cds-support-success)', 'var(--cds-support-warning)', 'var(--cds-support-error)', '#8b5cf6', '#ec4899', '#f43f5e'];

export default function AdminDashboard({ auth, metrics, chart_data }) {
    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard" />

            <div className="p-6 space-y-6">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Admin Analytics Dashboard</h2>

                {/* Top Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="bg-white p-6 shadow-md border border-gray-100" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--cds-text-secondary)', textTransform: 'uppercase' }}>Total Assets</p>
                            <p style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--cds-text-primary)', marginTop: '4px' }}>{metrics.total_assets}</p>
                        </div>
                        <div style={{ padding: '12px', background: 'var(--cds-layer-01)', borderRadius: '50%' }}>
                            <svg style={{ width: '2rem', height: '2rem', color: 'var(--cds-link-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                    </div>
                    <div className="bg-white p-6 shadow-md border border-gray-100" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--cds-text-secondary)', textTransform: 'uppercase' }}>Total Value (USD)</p>
                            <p style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--cds-support-success)', marginTop: '4px' }}>${Number(metrics.total_value || 0).toLocaleString()}</p>
                        </div>
                        <div style={{ padding: '12px', background: 'var(--cds-layer-01)', borderRadius: '50%' }}>
                            <svg style={{ width: '2rem', height: '2rem', color: 'var(--cds-support-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Charts — keep recharts as instructed */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Status Breakdown */}
                    <div className="bg-white p-6 shadow-md border border-gray-100">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>Asset Health (Status)</h3>
                        <div style={{ height: '18rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chart_data.status}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="status"
                                        label
                                    >
                                        {chart_data.status.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Condition Breakdown */}
                    <div className="bg-white p-6 shadow-md border border-gray-100">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>Asset Condition</h3>
                        <div style={{ height: '18rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chart_data.condition}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="condition" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="count" fill="var(--cds-interactive)" radius={[4, 4, 0, 0]} barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Department Breakdown */}
                    <div className="bg-white p-6 shadow-md border border-gray-100" style={{ gridColumn: '1 / -1' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>Assets by Department</h3>
                        <div style={{ height: '20rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chart_data.department}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip cursor={{fill: 'var(--cds-layer-01)'}} />
                                    <Bar dataKey="count" fill="var(--cds-support-success)" radius={[4, 4, 0, 0]} maxBarSize={80} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
