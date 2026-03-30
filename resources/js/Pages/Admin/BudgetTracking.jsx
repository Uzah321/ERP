import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Button, Tag,
    Select, SelectItem,
    Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
} from '@carbon/react';
import { Filter } from '@carbon/icons-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const fmt = (n) => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusTagType = (status) => {
    if (status === 'approved') return 'green';
    if (status === 'declined') return 'red';
    return 'yellow';
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

            <div className="p-6 space-y-6">
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Budget vs. Actual Tracking</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginTop: '4px' }}>Compare CAPEX budgets against Purchase Orders and invoiced amounts per department.</p>
                </div>

                {/* Filters */}
                <div className="bg-white border border-gray-200 p-4 shadow-sm" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                    <Select id="bt-dept" labelText="Department" value={departmentId} onChange={e => setDepartmentId(e.target.value)} style={{ minWidth: '200px' }}>
                        <SelectItem value="" text="All Departments" />
                        {departments.map(d => <SelectItem key={d.id} value={d.id} text={d.name} />)}
                    </Select>
                    <Select id="bt-year" labelText="Year" value={year} onChange={e => setYear(e.target.value)}>
                        {years.map(y => <SelectItem key={y} value={y} text={String(y)} />)}
                    </Select>
                    <Button renderIcon={Filter} onClick={applyFilters} kind="primary">Apply Filters</Button>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {[
                        { label: 'Total Budgeted (CAPEX)', value: summary.total_budgeted, color: 'var(--cds-link-primary)' },
                        { label: 'Total PO Amount',        value: summary.total_po,       color: 'var(--cds-link-primary)' },
                        { label: 'Total Invoiced',         value: summary.total_invoiced,  color: 'var(--cds-support-success)' },
                        { label: 'Total Variance',         value: summary.total_variance,  color: summary.total_variance >= 0 ? 'var(--cds-support-success)' : 'var(--cds-support-error)' },
                    ].map(card => (
                        <div key={card.label} className="bg-white border border-gray-200 p-5 shadow-sm">
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-placeholder)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: card.color, marginTop: '0.5rem' }}>{fmt(card.value)}</p>
                        </div>
                    ))}
                </div>

                {/* Bar Chart — keep recharts as instructed */}
                {byDepartment.length > 0 && (
                    <div className="bg-white border border-gray-200 shadow-sm p-6">
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>By Department</h2>
                        <div style={{ height: '16rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={byDepartment} margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                                    <YAxis tickFormatter={v => '$' + (v / 1000).toFixed(0) + 'k'} tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(v) => fmt(v)} />
                                    <Legend />
                                    <Bar dataKey="total_budgeted" name="Budgeted"  fill="var(--cds-interactive)" radius={[4,4,0,0]} />
                                    <Bar dataKey="total_po"       name="PO Amount" fill="var(--cds-link-primary)" radius={[4,4,0,0]} />
                                    <Bar dataKey="total_invoiced" name="Invoiced"  fill="var(--cds-support-success)" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Detail Table */}
                <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-200 px-5 py-3" style={{ background: 'var(--cds-layer-01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '0.875rem', fontWeight: 600 }}>CAPEX Budget Detail</h2>
                        <Tag type="blue" size="sm">{rows.length} records</Tag>
                    </div>
                    <Table size="lg" useZebraStyles>
                        <TableHead>
                            <TableRow>
                                <TableHeader>RTP Reference</TableHeader>
                                <TableHeader>Department</TableHeader>
                                <TableHeader>Requested By</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader>Budgeted</TableHeader>
                                <TableHeader>PO Amount</TableHeader>
                                <TableHeader>Invoiced</TableHeader>
                                <TableHeader>Variance</TableHeader>
                                <TableHeader>Date</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} style={{ textAlign: 'center', color: 'var(--cds-text-placeholder)' }}>No CAPEX records found for the selected filters.</TableCell>
                                </TableRow>
                            ) : rows.map(row => {
                                const over = row.variance < 0;
                                return (
                                    <TableRow key={row.id}>
                                        <TableCell><code style={{ color: 'var(--cds-link-primary)', fontWeight: 600, fontSize: '0.75rem' }}>{row.rtp_reference}</code></TableCell>
                                        <TableCell>{row.department}</TableCell>
                                        <TableCell>{row.requested_by}</TableCell>
                                        <TableCell><Tag type={statusTagType(row.status)} size="sm">{row.status}</Tag></TableCell>
                                        <TableCell><strong>{fmt(row.budgeted)}</strong></TableCell>
                                        <TableCell>
                                            {row.po_number
                                                ? <span style={{ color: 'var(--cds-link-primary)' }}>{fmt(row.po_amount)} <small style={{ color: 'var(--cds-text-placeholder)' }}>PO#{row.po_number}</small></span>
                                                : <span style={{ color: 'var(--cds-text-placeholder)', fontSize: '0.75rem' }}>No PO yet</span>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {row.invoiced > 0
                                                ? <span style={{ color: 'var(--cds-support-success)' }}>{fmt(row.invoiced)}</span>
                                                : <span style={{ color: 'var(--cds-text-placeholder)', fontSize: '0.75rem' }}>—</span>
                                            }
                                        </TableCell>
                                        <TableCell style={{ fontWeight: 600, color: over ? 'var(--cds-support-error)' : 'var(--cds-support-success)' }}>
                                            {over ? '▼ ' : '▲ '}{fmt(Math.abs(row.variance))}
                                        </TableCell>
                                        <TableCell style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{row.created_at}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
