import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function AssetRequests({ auth, requests, flash }) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['requests'] });
        }, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

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

                <div className="flex justify-end">
                    <a
                        href={route('asset-requests.export.csv')}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        Export CSV
                    </a>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Requested By</th>
                                <th className="px-4 py-3">From Dept</th>
                                <th className="px-4 py-3">Target Dept</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Asset Type</th>
                                <th className="px-4 py-3">For Whom</th>
                                <th className="px-4 py-3">Position</th>
                                <th className="px-4 py-3">Requirements</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.length === 0 && (
                                <tr><td colSpan="11" className="px-4 py-8 text-center text-gray-400">No asset requests found.</td></tr>
                            )}
                            {requests.map(req => (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{req.user_name}</td>
                                    <td className="px-4 py-3 text-gray-600">{req.department_name}</td>
                                    <td className="px-4 py-3 text-gray-600">{req.target_department_name}</td>
                                    <td className="px-4 py-3 text-gray-600">{req.asset_category}</td>
                                    <td className="px-4 py-3 text-gray-600">{req.asset_type}</td>
                                    <td className="px-4 py-3 text-gray-600">{req.for_whom}</td>
                                    <td className="px-4 py-3 text-gray-600 capitalize">{req.position}</td>
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
