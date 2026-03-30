import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    Tag,
} from '@carbon/react';

function typeTag(type) {
    const map = {
        Preventive: 'blue',
        Corrective: 'yellow',
        Emergency: 'red',
    };
    return map[type] || 'gray';
}

export default function MaintenanceHistory({ auth, asset, records }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-3">
                    <Link href={route('maintenance.index')} className="text-sm" style={{ color: 'var(--cds-link-primary)' }}>
                        &larr; Back
                    </Link>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--cds-text-primary)' }}>Maintenance History: {asset.name}</h2>
                </div>
            }
        >
            <Head title={`Maintenance - ${asset.name}`} />
            <div className="p-6 space-y-4">
                <div className="p-4 flex gap-6 text-sm" style={{ background: 'var(--cds-layer-01)', border: '1px solid var(--cds-border-subtle)' }}>
                    <div><span style={{ color: 'var(--cds-text-secondary)' }}>Barcode:</span> <strong>{asset.barcode}</strong></div>
                    <div><span style={{ color: 'var(--cds-text-secondary)' }}>Serial:</span> <strong>{asset.serial_number || 'N/A'}</strong></div>
                    <div><span style={{ color: 'var(--cds-text-secondary)' }}>Status:</span> <strong>{asset.status}</strong></div>
                </div>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Type</TableHeader>
                            <TableHeader>Issue</TableHeader>
                            <TableHeader>Vendor</TableHeader>
                            <TableHeader>Cost</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Start</TableHeader>
                            <TableHeader>End</TableHeader>
                            <TableHeader>Reported By</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {records.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8" style={{ color: 'var(--cds-text-placeholder)' }}>
                                    No maintenance records.
                                </TableCell>
                            </TableRow>
                        )}
                        {records.map((r) => (
                            <TableRow key={r.id}>
                                <TableCell>
                                    <Tag type={typeTag(r.maintenance_type)}>
                                        {r.maintenance_type || 'Corrective'}
                                    </Tag>
                                </TableCell>
                                <TableCell className="max-w-xs truncate">{r.issue_description}</TableCell>
                                <TableCell>{r.vendor_name || '—'}</TableCell>
                                <TableCell>{r.cost ? `$${Number(r.cost).toFixed(2)}` : '—'}</TableCell>
                                <TableCell>
                                    <Tag type={r.status === 'completed' ? 'green' : 'yellow'}>
                                        {r.status}
                                    </Tag>
                                </TableCell>
                                <TableCell>{r.start_date}</TableCell>
                                <TableCell>{r.end_date || '—'}</TableCell>
                                <TableCell>{r.user?.name || '—'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AuthenticatedLayout>
    );
}
