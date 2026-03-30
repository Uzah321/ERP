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
    Tile,
} from '@carbon/react';

export default function DepartmentRollup({ auth, rollups }) {
    const totalAssets = rollups.reduce((sum, r) => sum + r.asset_count, 0);
    const totalValue = rollups.reduce((sum, r) => sum + parseFloat(r.total_value), 0);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Department Rollup" />

            <div className="p-6">
                <h1 className="text-xl font-bold text-gray-800 mb-4">Department Rollup</h1>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Tile>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Assets</p>
                        <p className="text-2xl font-bold text-gray-800">{totalAssets}</p>
                    </Tile>
                    <Tile>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Estimated Value</p>
                        <p className="text-2xl font-bold text-gray-800">${totalValue.toLocaleString()}</p>
                    </Tile>
                </div>

                <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex justify-between items-center">
                        <h2 className="text-gray-800 font-semibold text-base">Department Summary</h2>
                        <Tag type="blue">{rollups.length} departments</Tag>
                    </div>

                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Department Name</TableHeader>
                                <TableHeader>Active Assets</TableHeader>
                                <TableHeader>Total Depreciated Value</TableHeader>
                                <TableHeader>Utilization</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rollups.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                                        No departments found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rollups.map((dept) => {
                                    const percentage = totalAssets > 0
                                        ? ((dept.asset_count / totalAssets) * 100).toFixed(1)
                                        : 0;
                                    return (
                                        <TableRow key={dept.id}>
                                            <TableCell className="font-medium text-gray-900">
                                                {dept.name}
                                            </TableCell>
                                            <TableCell>
                                                <Tag type="blue">{dept.asset_count}</Tag>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono font-medium text-green-700">
                                                    ${parseFloat(dept.total_value).toLocaleString()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500 w-8">
                                                        {percentage}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
