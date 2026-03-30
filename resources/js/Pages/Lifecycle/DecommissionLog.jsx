import { Head } from '@inertiajs/react';
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

export default function DecommissionLog({ auth, assets }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Decommission Log" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-800">Decommission Log</h1>
                    <Tag type="gray">{assets.length} items</Tag>
                </div>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Barcode / Serial</TableHeader>
                            <TableHeader>Asset Info</TableHeader>
                            <TableHeader>Department &amp; Location</TableHeader>
                            <TableHeader>Status</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                                    No decommissioned assets found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            assets.map((asset) => (
                                <TableRow key={asset.id}>
                                    <TableCell>
                                        <div className="font-mono font-semibold text-gray-800">{asset.barcode}</div>
                                        {asset.serial_number && (
                                            <div className="font-mono text-xs text-gray-600">{asset.serial_number}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-gray-900">{asset.name}</div>
                                        <div className="text-xs text-gray-500">{asset.category?.name || 'Uncategorized'}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-gray-800">{asset.department?.name || '-'}</div>
                                        <div className="text-xs text-gray-500">{asset.location?.name || '-'}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Tag type="red">Decommissioned</Tag>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </AuthenticatedLayout>
    );
}
