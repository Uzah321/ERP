import { useEffect, useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Button,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TextInput,
    ClickableTile,
    Tile,
} from '@carbon/react';
import { DocumentDownload, Download } from '@carbon/icons-react';

const procurementMetricCards = [
    { key: 'pending_capex', label: 'Pending CAPEX', accent: 'var(--cds-support-warning)' },
    { key: 'approved_waiting_po', label: 'Approved Awaiting PO', accent: 'var(--cds-link-primary)' },
    { key: 'open_purchase_orders', label: 'Open Purchase Orders', accent: 'var(--cds-interactive)' },
    { key: 'pending_invoices', label: 'Pending Invoices', accent: '#5e8fff' },
    { key: 'overdue_invoices', label: 'Overdue Invoices', accent: 'var(--cds-support-error)' },
    { key: 'paid_this_month', label: 'Paid This Month', accent: 'var(--cds-support-success)', format: 'currency' },
    { key: 'ytd_spend', label: 'YTD Spend', accent: 'var(--cds-support-success)', format: 'currency' },
];

const currency = (value) => '$' + Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const tabStyles = {
    base: {
        border: '1px solid var(--cds-border-subtle)',
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        background: 'var(--cds-layer-01)',
        color: 'var(--cds-text-secondary)',
    },
    active: {
        background: 'var(--cds-layer-selected)',
        color: 'var(--cds-text-primary)',
        borderColor: 'var(--cds-border-interactive)',
    },
};

export default function ReportsIndex({ auth, procurement_metrics = {}, recent_procurement_orders = [], procurement_last_updated_at }) {
    const isExecutive = auth.user.role === 'executive' || auth.user.is_super_user === true;
    const initialTab = useMemo(() => {
        if (typeof window === 'undefined') {
            return isExecutive ? 'procurement' : 'reports';
        }

        const params = new URLSearchParams(window.location.search);
        const requestedTab = params.get('tab');

        if (requestedTab === 'procurement' || requestedTab === 'reports') {
            return requestedTab;
        }

        return isExecutive ? 'procurement' : 'reports';
    }, [isExecutive]);
    const [filters, setFilters] = useState({
        department_id: '',
        status: '',
        date_from: '',
        date_to: '',
    });
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        params.set('tab', activeTab);
        const nextUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', nextUrl);
    }, [activeTab]);

    const buildQueryString = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
        return params.toString();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-2xl font-bold" style={{ color: 'var(--cds-text-primary)' }}>Analytics &amp; Reports</h2>}
        >
            <Head title="Analytics & Reports" />
            <div className="p-6 space-y-6">
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => setActiveTab('reports')} style={{ ...tabStyles.base, ...(activeTab === 'reports' ? tabStyles.active : null) }}>
                        Reports &amp; Exports
                    </button>
                    <button type="button" onClick={() => setActiveTab('procurement')} style={{ ...tabStyles.base, ...(activeTab === 'procurement' ? tabStyles.active : null) }}>
                        Procurement Analytics
                    </button>
                </div>

                {activeTab === 'procurement' ? (
                    <>
                        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(18rem, 1fr)' }}>
                            <Tile style={{ padding: '1.5rem', display: 'grid', gap: '0.75rem' }}>
                                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>
                                    Executive Procurement Analytics
                                </p>
                                <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                                    Procurement monitoring and spend analytics
                                </h1>
                                <p style={{ margin: 0, maxWidth: '46rem', color: 'var(--cds-text-secondary)', lineHeight: 1.6 }}>
                                    This tab is the procurement monitoring surface for executives and finance leads. Use it for backlog,
                                    invoice exposure, recent purchase movement, and spend-oriented export access without sharing the
                                    general reports landing experience.
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    <Button as={Link} href={route('procurement.dashboard')} kind="secondary" size="sm">Open procurement workflow</Button>
                                    <Button as={Link} href={route('procurement.pending')} kind="tertiary" size="sm">Open pending queue</Button>
                                </div>
                            </Tile>

                            <Tile style={{ padding: '1.5rem', display: 'grid', gap: '0.75rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Monitoring Notes</h2>
                                <p style={{ margin: 0, color: 'var(--cds-text-secondary)', lineHeight: 1.6 }}>
                                    Track the procurement backlog here, then move back into the workflow hub only when you need to transact.
                                </p>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                                    Last refreshed: {procurement_last_updated_at ?? 'Just now'}
                                </p>
                            </Tile>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--cds-text-secondary)' }}>
                                Procurement Analytics
                            </h3>
                            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                                {procurementMetricCards.map((card) => (
                                    <Tile key={card.key} style={{ padding: '1rem', borderTop: `4px solid ${card.accent}` }}>
                                        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {card.label}
                                        </p>
                                        <p style={{ margin: '0.75rem 0 0', fontSize: '1.75rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                                            {card.format === 'currency' ? currency(procurement_metrics[card.key]) : (procurement_metrics[card.key] ?? 0)}
                                        </p>
                                    </Tile>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--cds-text-secondary)' }}>
                                Procurement Monitoring
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <ClickableTile href={route('procurement.pending')}>
                                    <Download size={24} className="mb-2" style={{ color: 'var(--cds-link-primary)' }} />
                                    <p className="font-semibold" style={{ color: 'var(--cds-text-primary)' }}>Pending Procurement Queue</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--cds-text-secondary)' }}>Review approvals, orders awaiting receipt, invoice backlog, and unpaid items.</p>
                                </ClickableTile>
                                <ClickableTile href={route('reports.po-history.csv')}>
                                    <Download size={24} className="mb-2" style={{ color: 'var(--cds-support-success)' }} />
                                    <p className="font-semibold" style={{ color: 'var(--cds-text-primary)' }}>PO Movement Export</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--cds-text-secondary)' }}>Export purchase order history with vendor, status, and created-date context.</p>
                                </ClickableTile>
                                <ClickableTile href={route('reports.vendor-spend.csv')}>
                                    <Download size={24} className="mb-2" style={{ color: 'var(--cds-support-warning)' }} />
                                    <p className="font-semibold" style={{ color: 'var(--cds-text-primary)' }}>Vendor Spend Export</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--cds-text-secondary)' }}>Break total procurement expenditure down by supplier.</p>
                                </ClickableTile>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--cds-text-secondary)' }}>
                                Recent Purchase Orders
                            </h3>
                            <Tile style={{ padding: 0 }}>
                                <Table size="sm" useZebraStyles>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeader>PO</TableHeader>
                                            <TableHeader>Vendor</TableHeader>
                                            <TableHeader>Department</TableHeader>
                                            <TableHeader>Delivery</TableHeader>
                                            <TableHeader>Invoice</TableHeader>
                                            <TableHeader>Total</TableHeader>
                                            <TableHeader>Created</TableHeader>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recent_procurement_orders.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} style={{ textAlign: 'center', color: 'var(--cds-text-secondary)' }}>
                                                    No recent purchase orders available.
                                                </TableCell>
                                            </TableRow>
                                        ) : recent_procurement_orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell>{order.po_number}</TableCell>
                                                <TableCell>{order.vendor_name}</TableCell>
                                                <TableCell>{order.department}</TableCell>
                                                <TableCell>{order.delivery_status}</TableCell>
                                                <TableCell>{order.invoice_status}</TableCell>
                                                <TableCell>{currency(order.total_amount)}</TableCell>
                                                <TableCell>{order.created_at}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Tile>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(18rem, 1fr)' }}>
                            <Tile style={{ padding: '1.5rem', display: 'grid', gap: '0.75rem' }}>
                                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>
                                    Reports
                                </p>
                                <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                                    Export packs and operational reports
                                </h1>
                                <p style={{ margin: 0, maxWidth: '46rem', color: 'var(--cds-text-secondary)', lineHeight: 1.6 }}>
                                    Use this tab for the standard reporting workspace: asset register outputs, depreciation extracts,
                                    maintenance exports, and finance-ready operational files.
                                </p>
                            </Tile>

                            <Tile style={{ padding: '1.5rem', display: 'grid', gap: '0.75rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Role Routing</h2>
                                <p style={{ margin: 0, color: 'var(--cds-text-secondary)', lineHeight: 1.6 }}>
                                    Executives default into the procurement analytics tab, while the broader admin reporting workspace stays here.
                                </p>
                            </Tile>
                        </div>

                        {/* Filters */}
                        <div className="p-4" style={{ background: 'var(--cds-layer-01)', border: '1px solid var(--cds-border-subtle)' }}>
                            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--cds-text-secondary)' }}>
                                Filter Assets (for Asset Reports)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Select
                                    id="status-filter"
                                    labelText="Status"
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                >
                                    <SelectItem value="" text="All Statuses" />
                                    {['Available', 'Allocated', 'Under Maintenance', 'Retired', 'Purchased', 'Active Use', 'Decommissioned', 'Disposed'].map((s) => (
                                        <SelectItem key={s} value={s} text={s} />
                                    ))}
                                </Select>
                                <TextInput
                                    id="date-from"
                                    type="date"
                                    labelText="Date From"
                                    value={filters.date_from}
                                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                                />
                                <TextInput
                                    id="date-to"
                                    type="date"
                                    labelText="Date To"
                                    value={filters.date_to}
                                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Asset Reports */}
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--cds-text-secondary)' }}>
                                Asset Reports
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <ClickableTile href={`${route('reports.assets')}?${buildQueryString()}`}>
                                    <DocumentDownload size={24} className="mb-2" style={{ color: 'var(--cds-support-error)' }} />
                                    <p className="font-semibold" style={{ color: 'var(--cds-text-primary)' }}>Asset Report (PDF)</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--cds-text-secondary)' }}>Download filtered asset register as PDF</p>
                                </ClickableTile>
                                <ClickableTile href={`${route('reports.assets.csv')}?${buildQueryString()}`}>
                                    <Download size={24} className="mb-2" style={{ color: 'var(--cds-support-success)' }} />
                                    <p className="font-semibold" style={{ color: 'var(--cds-text-primary)' }}>Asset Report (CSV)</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--cds-text-secondary)' }}>Export filtered data for Excel / Google Sheets</p>
                                </ClickableTile>
                                <ClickableTile href={route('reports.depreciation.csv')}>
                                    <Download size={24} className="mb-2" style={{ color: 'var(--cds-support-warning)' }} />
                                    <p className="font-semibold" style={{ color: 'var(--cds-text-primary)' }}>Depreciation Schedule (CSV)</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--cds-text-secondary)' }}>Book value, annual depreciation per asset</p>
                                </ClickableTile>
                            </div>
                        </div>

                        {/* Financial Reports */}
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--cds-text-secondary)' }}>
                                Financial Reports
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <ClickableTile href={route('reports.po-history.csv')}>
                                    <Download size={24} className="mb-2" style={{ color: 'var(--cds-link-primary)' }} />
                                    <p className="font-semibold" style={{ color: 'var(--cds-text-primary)' }}>PO History (CSV)</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--cds-text-secondary)' }}>All purchase orders with vendor and status</p>
                                </ClickableTile>
                                <ClickableTile href={route('reports.vendor-spend.csv')}>
                                    <Download size={24} className="mb-2 text-purple-600" />
                                    <p className="font-semibold" style={{ color: 'var(--cds-text-primary)' }}>Vendor Spend (CSV)</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--cds-text-secondary)' }}>Total expenditure grouped by vendor</p>
                                </ClickableTile>
                                <ClickableTile href={route('reports.sage-export.csv')}>
                                    <Download size={24} className="mb-2 text-teal-600" />
                                    <p className="font-semibold" style={{ color: 'var(--cds-text-primary)' }}>Sage Accounting Export (CSV)</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--cds-text-secondary)' }}>Paid invoices in Sage-compatible PI format</p>
                                </ClickableTile>
                            </div>
                        </div>

                        {/* Operational Reports */}
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--cds-text-secondary)' }}>
                                Operational Reports
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <ClickableTile href={route('reports.maintenance')}>
                                    <Download size={24} className="mb-2 text-yellow-600" />
                                    <p className="font-semibold" style={{ color: 'var(--cds-text-primary)' }}>Maintenance Report</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--cds-text-secondary)' }}>Cost analysis and repair frequency</p>
                                </ClickableTile>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
