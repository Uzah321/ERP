import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    Tag,
} from '@carbon/react';
import { Time } from '@carbon/icons-react';

function statusTag(status) {
    const map = {
        'Active Use': 'green',
        'Available': 'green',
        'Allocated': 'blue',
        'Deployed': 'green',
        'Purchased': 'teal',
        'Registered': 'blue',
        'Under Maintenance': 'yellow',
        'Maintenance': 'yellow',
        'Audit': 'yellow',
        'Retired': 'gray',
        'Decommissioned': 'red',
        'Disposed': 'red',
    };
    return map[status] || 'gray';
}

export default function MaintenanceIndex({ auth, assets }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl leading-tight" style={{ color: 'var(--cds-text-primary)' }}>Maintenance &amp; Repair History</h2>}
        >
            <Head title="Maintenance Tracking" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold" style={{ color: 'var(--cds-text-primary)' }}>Asset Maintenance Tracking</h3>
                            <p className="text-sm mt-1" style={{ color: 'var(--cds-text-secondary)' }}>
                                Review the time in use and repair frequency for all assets.
                            </p>
                        </div>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Asset</TableHeader>
                                    <TableHeader>Status &amp; Condition</TableHeader>
                                    <TableHeader>Time in Use</TableHeader>
                                    <TableHeader>Times Repaired</TableHeader>
                                    <TableHeader>Actions</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {assets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8" style={{ color: 'var(--cds-text-secondary)' }}>
                                            No assets found in the system.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    assets.map((asset) => (
                                        <TableRow key={asset.id}>
                                            <TableCell>
                                                <div className="font-medium" style={{ color: 'var(--cds-text-primary)' }}>{asset.name}</div>
                                                <div className="text-xs mt-0.5" style={{ color: 'var(--cds-text-secondary)' }}>
                                                    SN: {asset.serial_number || 'N/A'} &bull; {asset.barcode}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Tag type={statusTag(asset.status)}>{asset.status}</Tag>
                                                <span className="text-sm ml-2" style={{ color: 'var(--cds-text-secondary)' }}>{asset.condition}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1" style={{ color: 'var(--cds-text-secondary)' }}>
                                                    <Time size={16} style={{ color: 'var(--cds-text-placeholder)' }} />
                                                    {asset.time_in_use}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Tag type="blue">{asset.repair_count}</Tag>
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={route('maintenance.show', asset.id)}
                                                    className="text-xs font-medium"
                                                    style={{ color: 'var(--cds-link-primary)' }}
                                                >
                                                    View History
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
