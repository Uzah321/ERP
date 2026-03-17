import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function AssetRequests({ auth, requests, flash }) {
    const handleAction = (id, status) => {
        router.patch(route('asset-requests.update', id), { status });
    };

    const statusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-2xl font-bold text-gray-800">Asset Requests</h2>}>
            <Head title="Asset Requests" />
            <div className="p-6 space-y-6">
                {flash?.success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{flash.success}</div>}

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Requested By</th>
                                <th className="px-4 py-3">From Dept</th>
                                <th className="px-4 py-3">Target Dept</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Requirements</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.length === 0 && (
                                <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">No asset requests found.</td></tr>
                            )}
                            {requests.map(req => (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{req.user_name}</td>
                                    <td className="px-4 py-3 text-gray-600">{req.department_name}</td>
                                    <td className="px-4 py-3 text-gray-600">{req.target_department_name}</td>
                                    <td className="px-4 py-3 text-gray-600">{req.asset_category}</td>
                                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{req.requirements}</td>
                                    <td className="px-4 py-3">{statusBadge(req.status)}</td>
                                    <td className="px-4 py-3 text-gray-500">{req.created_at}</td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        {req.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleAction(req.id, 'approved')} className="text-green-600 hover:text-green-800 text-xs font-medium">Approve</button>
                                                <button onClick={() => handleAction(req.id, 'rejected')} className="text-red-600 hover:text-red-800 text-xs font-medium">Reject</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
