import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tag, Tile } from '@carbon/react';
import { BarChart, Bar, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';

const COLORS = ['var(--cds-interactive)', 'var(--cds-support-success)', 'var(--cds-support-warning)', 'var(--cds-support-error)', '#5e5ce6', '#d12771'];

const statusTone = {
    open: 'blue',
    partial: 'yellow',
    delivered: 'green',
    pending: 'gray',
};

const currency = (value) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function ExecutiveDashboard({ auth, metrics, chart_data, recent_purchases, top_departments }) {
    const cards = [
        { label: 'Total Assets', value: metrics.total_assets },
        { label: 'Asset Portfolio Value', value: currency(metrics.total_value) },
        { label: 'Pending CAPEX', value: metrics.pending_capex },
        { label: 'Awaiting PO', value: metrics.approved_waiting_po },
        { label: 'Open Purchase Orders', value: metrics.open_purchase_orders },
        { label: 'YTD Spend', value: currency(metrics.ytd_spend) },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Executive Dashboard" />

            <div className="space-y-6">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>Executive Dashboard</h1>
                        <p style={{ margin: '0.5rem 0 0', color: 'var(--cds-text-secondary)', maxWidth: '52rem' }}>
                            A high-level summary of asset posture, procurement exposure, and the departments driving the largest operational footprint.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <Button as={Link} href={route('procurement.dashboard')} kind="primary" size="sm">Open Purchase Dashboard</Button>
                        <Button as={Link} href={route('procurement.pending')} kind="tertiary" size="sm">Review Pending Purchases</Button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem' }}>
                    {cards.map((card) => (
                        <Tile key={card.label}>
                            <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>{card.label}</p>
                            <p style={{ margin: '0.75rem 0 0', fontSize: '1.75rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>{card.value}</p>
                        </Tile>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1rem' }}>
                    <Tile>
                        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginTop: 0 }}>Assets by Department</h2>
                        <div style={{ height: '20rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chart_data.department}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip cursor={{ fill: 'var(--cds-layer-01)' }} />
                                    <Bar dataKey="count" fill="var(--cds-link-primary)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Tile>

                    <Tile>
                        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginTop: 0 }}>Asset Status Mix</h2>
                        <div style={{ height: '20rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chart_data.status} dataKey="count" nameKey="status" innerRadius={55} outerRadius={88} paddingAngle={4}>
                                        {chart_data.status.map((entry, index) => <Cell key={entry.status ?? index} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Tile>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Tile>
                        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginTop: 0 }}>Recent Purchase Activity</h2>
                        <Table size="sm" useZebraStyles>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>PO</TableHeader>
                                    <TableHeader>Vendor</TableHeader>
                                    <TableHeader>Department</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Total</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recent_purchases.map((purchase) => (
                                    <TableRow key={purchase.id}>
                                        <TableCell>{purchase.po_number}</TableCell>
                                        <TableCell>{purchase.vendor_name}</TableCell>
                                        <TableCell>{purchase.department}</TableCell>
                                        <TableCell><Tag type={statusTone[purchase.delivery_status] ?? 'gray'}>{purchase.delivery_status}</Tag></TableCell>
                                        <TableCell>{currency(purchase.total_amount)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Tile>

                    <Tile>
                        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginTop: 0 }}>Top Departments by Asset Count</h2>
                        <Table size="sm" useZebraStyles>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Department</TableHeader>
                                    <TableHeader>Assets</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {top_departments.map((department) => (
                                    <TableRow key={department.id}>
                                        <TableCell>{department.name}</TableCell>
                                        <TableCell>{department.assets_count}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Tile>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}