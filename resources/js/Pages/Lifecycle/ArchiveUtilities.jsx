import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    Button,
    Tag,
    Modal,
} from '@carbon/react';
import { Renew } from '@carbon/icons-react';

export default function ArchiveUtilities({ auth, archivedAssets }) {
    const [confirmId, setConfirmId] = useState(null);

    const handleRestore = (id) => {
        setConfirmId(id);
    };

    const confirmRestore = () => {
        router.post(route('archive.restore', confirmId));
        setConfirmId(null);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Archive Utilities" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-800">Archive Utilities</h1>
                    <Tag type="gray">{archivedAssets.length} items</Tag>
                </div>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Deleted At</TableHeader>
                            <TableHeader>Asset</TableHeader>
                            <TableHeader>Category / Location</TableHeader>
                            <TableHeader>Actions</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {archivedAssets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                                    No archived assets found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            archivedAssets.map((asset) => (
                                <TableRow key={asset.id}>
                                    <TableCell>
                                        <span className="font-mono text-xs">
                                            {new Date(asset.deleted_at).toLocaleString()}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-gray-900">{asset.name}</div>
                                        <div className="text-xs text-gray-500">{asset.barcode}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-gray-800">{asset.category?.name || '-'}</div>
                                        <div className="text-xs text-gray-500">{asset.location?.name || '-'}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            kind="ghost"
                                            size="sm"
                                            renderIcon={Renew}
                                            onClick={() => handleRestore(asset.id)}
                                        >
                                            Restore Data
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Modal
                open={!!confirmId}
                modalHeading="Restore Asset"
                primaryButtonText="Restore"
                secondaryButtonText="Cancel"
                onRequestClose={() => setConfirmId(null)}
                onRequestSubmit={confirmRestore}
            >
                <p>Are you sure you want to restore this asset back to active inventory?</p>
            </Modal>
        </AuthenticatedLayout>
    );
}
