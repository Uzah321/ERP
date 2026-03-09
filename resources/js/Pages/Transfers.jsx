import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Transfers({ auth, transfers }) {
    const { patch, processing } = useForm();

    const handleAction = (transferId, newStatus) => {
        if(confirm('Are you sure you want to ' + newStatus + ' this transfer request?')) {
            patch(route('transfers.update', transferId), {
                data: { status: newStatus },
                preserveScroll: true,
            });
        }
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
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            {transfers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                            <tr>
                                                <th className="py-3 px-4">Asset</th>
                                                <th className="py-3 px-4">Requested By</th>
                                                <th className="py-3 px-4">Target Dept</th>
                                                <th className="py-3 px-4">Target Location</th>
                                                <th className="py-3 px-4">Reason</th>
                                                <th className="py-3 px-4 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transfers.map((transfer) => (
                                                <tr key={transfer.id} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-4 font-semibold text-indigo-600">
                                                        {transfer.asset?.name} <br/>
                                                        <span className="text-xs text-gray-500 font-mono">{transfer.asset?.barcode}</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {transfer.requester?.name}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {transfer.target_department?.name || '-'}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {transfer.target_location?.name || '-'}
                                                    </td>
                                                    <td className="py-3 px-4 italic text-gray-600">
                                                        "{transfer.reason}"
                                                    </td>
                                                    <td className="py-3 px-4 flex justify-center space-x-2">
                                                        <PrimaryButton 
                                                            onClick={() => handleAction(transfer.id, 'approved')}
                                                            disabled={processing}
                                                            className="bg-green-600 hover:bg-green-700 focus:bg-green-700"
                                                        >
                                                            Approve
                                                        </PrimaryButton>
                                                        <SecondaryButton 
                                                            onClick={() => handleAction(transfer.id, 'rejected')}
                                                            disabled={processing}
                                                            className="text-red-600 border-red-300 hover:bg-red-50"
                                                        >
                                                            Reject
                                                        </SecondaryButton>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                                    No pending transfer requests at this time.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

