import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    Select,
    SelectItem,
    TextInput,
    ClickableTile,
} from '@carbon/react';
import { DocumentDownload, Download } from '@carbon/icons-react';

export default function ReportsIndex({ auth, flash }) {
    const [filters, setFilters] = useState({
        department_id: '',
        status: '',
        date_from: '',
        date_to: '',
    });

    const buildQueryString = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
        return params.toString();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-2xl font-bold" style={{ color: 'var(--cds-text-primary)' }}>Reports &amp; Export</h2>}
        >
            <Head title="Reports" />
            <div className="p-6 space-y-6">
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
            </div>
        </AuthenticatedLayout>
    );
}
