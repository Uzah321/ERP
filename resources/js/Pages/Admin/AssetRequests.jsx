import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Button, InlineNotification, Tag,
    Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
} from '@carbon/react';
import { Download } from '@carbon/icons-react';

const statusTagType = (status) => {
    if (status === 'approved') return 'green';
    if (status === 'pending') return 'blue';
    if (status === 'rejected') return 'red';
    return 'gray';
};

export default function AssetRequests({ auth, requests, flash }) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['requests'] });
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = (id, status) => {
        router.patch(route('asset-requests.update', id), { status });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Asset Requests" />
            <div className="p-6 space-y-4">
                {flash?.success && (
                    <InlineNotification kind="success" title="Success" subtitle={flash.success} lowContrast onClose={() => {}} />
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        renderIcon={Download}
                        kind="secondary"
                        size="sm"
                        as="a"
                        href={route('asset-requests.export.csv')}
                    >
                        Export CSV
                    </Button>
                </div>

                <Table size="lg" useZebraStyles>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Requested By</TableHeader>
                            <TableHeader>From Dept</TableHeader>
                            <TableHeader>Target Dept</TableHeader>
                            <TableHeader>Category</TableHeader>
                            <TableHeader>Asset Type</TableHeader>
                            <TableHeader>For Whom</TableHeader>
                            <TableHeader>Position</TableHeader>
                            <TableHeader>Requirements</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Date</TableHeader>
                            <TableHeader>Actions</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={11} style={{ textAlign: 'center', color: '#9ca3af' }}>No asset requests found.</TableCell>
                            </TableRow>
                        )}
                        {requests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell><strong>{req.user_name}</strong></TableCell>
                                <TableCell>{req.department_name}</TableCell>
                                <TableCell>{req.target_department_name}</TableCell>
                                <TableCell>{req.asset_category}</TableCell>
                                <TableCell>{req.asset_type}</TableCell>
                                <TableCell>{req.for_whom}</TableCell>
                                <TableCell style={{ textTransform: 'capitalize' }}>{req.position}</TableCell>
                                <TableCell>
                                    <span style={{ maxWidth: '12rem', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {req.requirements}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Tag type={statusTagType(req.status)} size="sm">{req.status}</Tag>
                                </TableCell>
                                <TableCell>{req.created_at}</TableCell>
                                <TableCell>
                                    {req.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button kind="primary" size="sm" onClick={() => handleAction(req.id, 'approved')}>Approve</Button>
                                            <Button kind="danger" size="sm" onClick={() => handleAction(req.id, 'rejected')}>Reject</Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AuthenticatedLayout>
    );
}
