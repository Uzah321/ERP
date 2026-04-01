import { Link } from '@inertiajs/react';
import {
    Button,
    DataTable,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableHeader,
    TableRow,
    Tag,
    Tile,
} from '@carbon/react';
import { BarChart, Bar, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { safeRoute } from '@/utils/ziggy';

const CHART_COLORS = [
    'var(--cds-interactive)',
    'var(--cds-support-success)',
    'var(--cds-support-warning)',
    'var(--cds-support-error)',
    '#5e8fff',
    '#0f62fe',
];

function eventTag(event) {
    const tone = {
        created: 'green',
        updated: 'blue',
        deleted: 'red',
    };

    return <Tag type={tone[event] ?? 'gray'}>{event || 'activity'}</Tag>;
}

function currency(value) {
    return '$' + Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statValue(card) {
    return card.format === 'currency' ? currency(card.value) : Number(card.value || 0).toLocaleString();
}

function alertRoute(alert, role) {
    const isPrivilegedRole = role === 'admin' || role === 'executive';

    if (alert.route_name) {
        return safeRoute(alert.route_name, alert.route_params ?? undefined);
    }

    if (alert.id === 'pending-capex') {
        return isPrivilegedRole ? safeRoute('admin.capex.index') : safeRoute('procurement.pending');
    }

    if (alert.id === 'awaiting-invoices') {
        return isPrivilegedRole ? safeRoute('goods-receipts.index') : safeRoute('procurement.pending');
    }

    if (alert.id === 'overdue-invoices') {
        return isPrivilegedRole ? safeRoute('invoices.index') : safeRoute('procurement.pending');
    }

    if (alert.id === 'pending-transfers') {
        return isPrivilegedRole ? safeRoute('admin.allocations.index') : safeRoute('activity-log.index');
    }

    if (alert.id === 'open-maintenance') {
        return safeRoute('maintenance.index');
    }

    return safeRoute('asset-management.index');
}

function topComplexRoute(item, supportsLocationHierarchy) {
    if (!supportsLocationHierarchy) {
        return safeRoute('store-management.index');
    }

    return safeRoute(item.route_name, item.id);
}

export default function OverviewWorkspace({
    role,
    eyebrow,
    title,
    description,
    metrics: metricsProp,
    alerts: alertsProp,
    quickStats: quickStatsProp,
    chartData,
    recentActivity,
    topComplexes,
    lastUpdatedAt,
    headerActions,
    quickActions,
    supplementaryMetrics = [],
    onRefresh,
    supportsLocationHierarchy,
    metricCards,
}) {
    const metrics = metricsProp ?? {};
    const alerts = alertsProp ?? [];
    const quickStats = quickStatsProp ?? { daily: {}, weekly: {} };
    const chartDataSafe = chartData ?? { distribution: [], condition: [], status: [] };
    const recentActivitySafe = recentActivity ?? [];
    const topComplexesSafe = topComplexes ?? [];
    const activityLogHref = safeRoute('activity-log.index');
    const storeManagementHref = safeRoute('store-management.index');

    const defaultMetricCards = [
        { label: 'Total Assets', value: metrics.total_assets, tone: 'var(--cds-text-primary)' },
        { label: 'Users', value: metrics.total_users, tone: 'var(--cds-link-primary)' },
        { label: supportsLocationHierarchy ? 'Complexes' : 'Locations', value: metrics.total_complexes, tone: 'var(--cds-support-success)' },
        { label: 'Stores / Shops', value: metrics.total_stores, tone: 'var(--cds-support-success)' },
        { label: 'Transfers', value: metrics.total_transfers, tone: 'var(--cds-support-warning)' },
        { label: 'Maintenance Jobs', value: metrics.total_maintenance, tone: 'var(--cds-support-error)' },
        { label: 'Portfolio Value', value: metrics.total_value, tone: 'var(--cds-interactive)', format: 'currency' },
        { label: 'New This Week', value: metrics.new_assets_week, tone: '#5e8fff' },
    ];

    return (
        <div className="space-y-6 p-6" style={{ background: 'linear-gradient(180deg, #f4f7fb 0%, #ffffff 42%)' }}>
            <Tile style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #f4f4f4 0%, #edf5ff 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ maxWidth: '52rem' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>{eyebrow}</p>
                        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0 0', color: 'var(--cds-text-primary)' }}>{title}</h1>
                        <p style={{ margin: '0.75rem 0 0', color: 'var(--cds-text-secondary)', lineHeight: 1.6 }}>{description}</p>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                            <Tag type="blue">Live monitoring</Tag>
                            <Tag type="cool-gray">Last sync {lastUpdatedAt}</Tag>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {headerActions}
                        <Button kind="ghost" size="sm" onClick={onRefresh}>Refresh</Button>
                    </div>
                </div>
            </Tile>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem' }}>
                {(metricCards ?? defaultMetricCards).map((card) => (
                    <Tile key={card.label} style={{ minHeight: '8.5rem' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>{card.label}</p>
                        <p style={{ margin: '0.75rem 0 0', fontSize: '1.9rem', fontWeight: 600, color: card.tone }}>{statValue(card)}</p>
                    </Tile>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(18rem, 0.7fr)', gap: '1rem' }}>
                <Tile>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Real-Time Alerts</h2>
                            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>Operational issues that need attention right now.</p>
                        </div>
                        <Tag type={alerts.length > 0 ? 'red' : 'green'}>{alerts.length > 0 ? `${alerts.length} active` : 'Clear'}</Tag>
                    </div>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {alerts.length === 0 && (
                            <div style={{ border: '1px dashed var(--cds-border-subtle)', padding: '1rem', color: 'var(--cds-text-secondary)' }}>
                                No active alerts. Transfer requests, maintenance work, and new asset intake are all within normal thresholds.
                            </div>
                        )}

                        {alerts.map((alert) => (
                            <div key={alert.id} style={{ border: '1px solid var(--cds-border-subtle)', background: 'var(--cds-layer-01)', padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--cds-text-primary)' }}>{alert.title}</p>
                                        <p style={{ margin: '0.35rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>{alert.description}</p>
                                    </div>
                                    <Tag type={alert.tone}>{alert.tone}</Tag>
                                </div>
                                <div style={{ marginTop: '0.75rem' }}>
                                    {alertRoute(alert, role) && (
                                    <Button as={Link} href={alertRoute(alert, role)} kind="ghost" size="sm">{alert.cta}</Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Tile>

                <Tile>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Quick Stats</h2>
                    <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>Today</p>
                            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
                                <div><strong>{quickStats.daily?.assets_added ?? 0}</strong> assets added</div>
                                <div><strong>{quickStats.daily?.transfer_requests ?? 0}</strong> transfer requests</div>
                                <div><strong>{quickStats.daily?.maintenance_opened ?? 0}</strong> maintenance items opened</div>
                                <div><strong>{quickStats.daily?.active_users ?? 0}</strong> active users</div>
                            </div>
                        </div>

                        <div>
                            <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>This Week</p>
                            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
                                <div><strong>{quickStats.weekly?.assets_added ?? 0}</strong> assets added</div>
                                <div><strong>{quickStats.weekly?.transfer_requests ?? 0}</strong> transfer requests</div>
                                <div><strong>{quickStats.weekly?.transfers_completed ?? 0}</strong> transfers completed</div>
                                <div><strong>{quickStats.weekly?.maintenance_completed ?? 0}</strong> maintenance items closed</div>
                                <div><strong>{quickStats.weekly?.active_users ?? 0}</strong> active users</div>
                            </div>
                        </div>

                        {supplementaryMetrics.length > 0 && (
                            <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>Additional Monitoring</p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                                    {supplementaryMetrics.map((item) => (
                                        <Tag key={item.label} type={item.type ?? 'cool-gray'}>{item.label}: {item.value}</Tag>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Tile>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(17rem, 1fr))', gap: '1rem' }}>
                {quickActions.filter((action) => action.href).map((action) => (
                    <Tile key={action.title}>
                        <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>{action.eyebrow}</p>
                        <h3 style={{ margin: '0.5rem 0 0', fontSize: '1.125rem', fontWeight: 600 }}>{action.title}</h3>
                        <p style={{ margin: '0.75rem 0 0', color: 'var(--cds-text-secondary)', minHeight: '3rem' }}>{action.description}</p>
                        <div style={{ marginTop: '1rem' }}>
                            <Button as={Link} href={action.href} kind={action.kind ?? 'ghost'} size="sm">{action.cta}</Button>
                        </div>
                    </Tile>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1rem' }}>
                <Tile>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Asset Distribution</h2>
                    <div style={{ height: '18rem', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartDataSafe.distribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="var(--cds-link-primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Tile>

                <Tile>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Condition Overview</h2>
                    <div style={{ height: '18rem', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartDataSafe.condition}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="var(--cds-support-success)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Tile>

                <Tile>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Status Mix</h2>
                    <div style={{ height: '18rem', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartDataSafe.status} dataKey="count" nameKey="label" innerRadius={52} outerRadius={84} paddingAngle={4}>
                                    {chartDataSafe.status.map((entry, index) => (
                                        <Cell key={entry.label ?? index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Tile>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(20rem, 0.9fr)', gap: '1rem' }}>
                <Tile>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Recent Activity</h2>
                            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>Latest asset, transfer, maintenance, and administration changes.</p>
                        </div>
                        {activityLogHref && <Button as={Link} href={activityLogHref} kind="ghost" size="sm">Open activity log</Button>}
                    </div>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {recentActivitySafe.map((activity) => (
                            <div key={activity.id} style={{ borderLeft: '4px solid var(--cds-interactive)', background: 'var(--cds-layer-01)', padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'grid', gap: '0.35rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                            {eventTag(activity.event)}
                                            <Tag type="cool-gray">{activity.subject_type || 'Record'}</Tag>
                                        </div>
                                        <div style={{ fontWeight: 600, color: 'var(--cds-text-primary)' }}>{activity.description}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                                            {activity.causer} on {activity.subject_name}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', color: 'var(--cds-text-secondary)', fontSize: '0.75rem' }}>
                                        <div>{activity.created_at}</div>
                                        <div>{activity.created_at_human}</div>
                                    </div>
                                </div>

                                {activity.subject_type === 'Asset' && activity.subject_id && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        {safeRoute('activity-log.asset', activity.subject_id) && <Button as={Link} href={safeRoute('activity-log.asset', activity.subject_id)} kind="ghost" size="sm">Open asset history</Button>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Tile>

                <Tile>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Top Complexes</h2>
                            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>Highest-footprint sites with direct drill-through navigation.</p>
                        </div>
                        {storeManagementHref && <Button as={Link} href={storeManagementHref} kind="ghost" size="sm">Open locations</Button>}
                    </div>

                    <TableContainer>
                        <Table size="sm" useZebraStyles>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>{supportsLocationHierarchy ? 'Complex' : 'Location'}</TableHeader>
                                    <TableHeader>Stores</TableHeader>
                                    <TableHeader>Assets</TableHeader>
                                    <TableHeader />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {topComplexesSafe.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} style={{ textAlign: 'center', color: 'var(--cds-text-secondary)' }}>No locations available.</TableCell>
                                    </TableRow>
                                )}
                                {topComplexesSafe.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>{item.address || 'No address recorded'}</div>
                                        </TableCell>
                                        <TableCell>{item.stores_count}</TableCell>
                                        <TableCell>{item.assets_count}</TableCell>
                                        <TableCell>
                                            {topComplexRoute(item, supportsLocationHierarchy) && (
                                                <Button as={Link} href={topComplexRoute(item, supportsLocationHierarchy)} kind="ghost" size="sm">
                                                    View
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Tile>
            </div>
        </div>
    );
}