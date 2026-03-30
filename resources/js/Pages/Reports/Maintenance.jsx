import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    Tag,
    Tile,
} from '@carbon/react';

function typeTag(type) {
    const map = {
        Preventive: 'blue',
        Corrective: 'yellow',
        Emergency: 'red',
    };
    return map[type] || 'gray';
}

export default function MaintenanceReport({ auth, records, totalCost, avgCost, mostRepaired }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-2xl font-bold text-gray-800">Maintenance Report</h2>}
        >
            <Head title="Maintenance Report" />
            <div className="p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <Tile>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Total Maintenance Cost</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">${totalCost.toLocaleString()}</div>
                    </Tile>
                    <Tile>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Average Cost per Record</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">${avgCost.toLocaleString()}</div>
                    </Tile>
                    <Tile>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">Total Records</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{records.length}</div>
                    </Tile>
                </div>

                {/* Most Repaired Assets */}
                {mostRepaired.length > 0 && (
                    <Tile>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Most Frequently Repaired Assets
                        </h3>
                        <div className="space-y-2">
                            {mostRepaired.map((item, i) => (
                                <div key={item.asset_id} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700">
                                        <span className="font-medium text-gray-900 mr-2">#{i + 1}</span>
                                        {item.asset?.name || `Asset #${item.asset_id}`}
                                    </span>
                                    <Tag type="yellow">{item.cnt} repairs</Tag>
                                </div>
                            ))}
                        </div>
                    </Tile>
                )}

                {/* Records Table */}
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Asset</TableHeader>
                            <TableHeader>Type</TableHeader>
                            <TableHeader>Issue</TableHeader>
                            <TableHeader>Vendor</TableHeader>
                            <TableHeader>Cost</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Start</TableHeader>
                            <TableHeader>End</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {records.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                                    No maintenance records found.
                                </TableCell>
                            </TableRow>
                        )}
                        {records.map((r) => (
                            <TableRow key={r.id}>
                                <TableCell className="font-medium text-gray-900">{r.asset?.name}</TableCell>
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
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AuthenticatedLayout>
    );
}
