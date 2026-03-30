import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    Button,
    Modal,
    Tag,
} from '@carbon/react';

export default function Transfers({ auth, transfers }) {
    const { patch, processing } = useForm();
    const [confirmModal, setConfirmModal] = useState({ open: false, id: null, status: null });

    const handleAction = (transferId, newStatus) => {
        setConfirmModal({ open: true, id: transferId, status: newStatus });
    };

    const confirmAction = () => {
        patch(route('transfers.update', confirmModal.id), {
            data: { status: confirmModal.status },
            preserveScroll: true,
            onFinish: () => setConfirmModal({ open: false, id: null, status: null }),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Pending Transfer Approvals
                </h2>
            }
        >
            <Head title="Transfers Approvals" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {transfers.length > 0 ? (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Asset</TableHeader>
                                    <TableHeader>Requested By</TableHeader>
                                    <TableHeader>Target Dept</TableHeader>
                                    <TableHeader>Target Location</TableHeader>
                                    <TableHeader>Reason</TableHeader>
                                    <TableHeader>Action</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transfers.map((transfer) => (
                                    <TableRow key={transfer.id}>
                                        <TableCell>
                                            <div className="font-semibold text-blue-700">{transfer.asset?.name}</div>
                                            <div className="text-xs text-gray-500 font-mono">{transfer.asset?.barcode}</div>
                                        </TableCell>
                                        <TableCell>{transfer.requester?.name}</TableCell>
                                        <TableCell>{transfer.target_department?.name || '-'}</TableCell>
                                        <TableCell>{transfer.target_location?.name || '-'}</TableCell>
                                        <TableCell>
                                            <em className="text-gray-600">&ldquo;{transfer.reason}&rdquo;</em>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    kind="primary"
                                                    size="sm"
                                                    onClick={() => handleAction(transfer.id, 'approved')}
                                                    disabled={processing}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    kind="danger--ghost"
                                                    size="sm"
                                                    onClick={() => handleAction(transfer.id, 'rejected')}
                                                    disabled={processing}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="p-8 text-center text-gray-500 bg-gray-50 border border-dashed">
                            No pending transfer requests at this time.
                        </div>
                    )}
                </div>
            </div>

            <Modal
                open={confirmModal.open}
                danger={confirmModal.status === 'rejected'}
                modalHeading={`Confirm ${confirmModal.status === 'approved' ? 'Approval' : 'Rejection'}`}
                primaryButtonText={`Yes, ${confirmModal.status === 'approved' ? 'Approve' : 'Reject'}`}
                secondaryButtonText="Cancel"
                onRequestClose={() => setConfirmModal({ open: false, id: null, status: null })}
                onRequestSubmit={confirmAction}
                primaryButtonDisabled={processing}
            >
                <p>Are you sure you want to {confirmModal.status} this transfer request?</p>
            </Modal>
        </AuthenticatedLayout>
    );
}
