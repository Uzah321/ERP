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

export default function DisposalLog({ auth, disposals }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Disposal Certificates" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-800">Disposal Log</h1>
                    <Tag type="red">{disposals.length} records</Tag>
                </div>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Date</TableHeader>
                            <TableHeader>Asset</TableHeader>
                            <TableHeader>Method</TableHeader>
                            <TableHeader>Reason</TableHeader>
                            <TableHeader>Recovery Val.</TableHeader>
                            <TableHeader>Authorized By</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {disposals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                    No disposed assets found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            disposals.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <span className="font-mono text-xs">{log.created_at}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-gray-900">{log.asset_name}</div>
                                        <div className="text-xs text-gray-500">{log.asset_barcode}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Tag type="gray">{log.method}</Tag>
                                    </TableCell>
                                    <TableCell className="whitespace-normal min-w-[200px]">
                                        {log.reason}
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-green-700">
                                            ${parseFloat(log.recovery_amount || 0).toFixed(2)}
                                        </span>
                                    </TableCell>
                                    <TableCell>{log.user_name}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </AuthenticatedLayout>
    );
}
