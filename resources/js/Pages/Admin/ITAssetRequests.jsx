import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    InlineNotification, Tag,
    Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
} from '@carbon/react';

const statusTagType = (status) => {
    if (status === 'approved') return 'green';
    if (status === 'pending') return 'blue';
    if (status === 'rejected') return 'red';
    return 'gray';
};

export default function ITAssetRequests({ auth, requests, flash }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="IT Asset Requests" />
            <div className="p-6 space-y-4">
                {flash?.success && (
                    <InlineNotification kind="success" title="Success" subtitle={flash.success} lowContrast onClose={() => {}} />
                )}

                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>IT Asset Requests (from Other Departments)</h2>

                <Table size="lg" useZebraStyles>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Requested By</TableHeader>
                            <TableHeader>From Dept</TableHeader>
                            <TableHeader>Asset Category</TableHeader>
                            <TableHeader>Asset Type</TableHeader>
                            <TableHeader>For Whom</TableHeader>
                            <TableHeader>Requirements</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader>Date</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} style={{ textAlign: 'center', color: 'var(--cds-text-placeholder)' }}>No asset requests found.</TableCell>
                            </TableRow>
                        )}
                        {requests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell><strong>{req.user_name}</strong></TableCell>
                                <TableCell>{req.department_name}</TableCell>
                                <TableCell>{req.asset_category}</TableCell>
                                <TableCell>{req.asset_type}</TableCell>
                                <TableCell>{req.for_whom}</TableCell>
                                <TableCell>
                                    <span style={{ maxWidth: '12rem', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {req.requirements}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Tag type={statusTagType(req.status)} size="sm">{req.status}</Tag>
                                </TableCell>
                                <TableCell>{req.created_at}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AuthenticatedLayout>
    );
}
