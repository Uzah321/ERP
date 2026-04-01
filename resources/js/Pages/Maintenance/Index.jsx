import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import {
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    Tag,
    Button,
    Modal,
    Select,
    SelectItem,
    TextArea,
    TextInput
} from '@carbon/react';
import { Time, Add } from '@carbon/icons-react';

function statusTag(status) {
    const map = {
        'Active Use': 'green',
        'Available': 'green',
        'Allocated': 'blue',
        'Deployed': 'green',
        'Purchased': 'teal',
        'Registered': 'blue',
        'Under Maintenance': 'yellow',
        'Maintenance': 'yellow',
        'Audit': 'yellow',
        'Retired': 'gray',
        'Decommissioned': 'red',
        'Disposed': 'red',
    };
    return map[status] || 'gray';
}

export default function MaintenanceIndex({ auth, assets, stores }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedStore, setSelectedStore] = useState('');
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        asset_id: '',
        maintenance_type: 'Preventive',
        issue_description: '',
        vendor_name: '',
        scheduled_date: '',
    });

    const filteredAssets = assets.filter(a => String(a.store_id) === String(selectedStore));

    const handleSubmit = (e) => {
        post(route('maintenance.store', data.asset_id), {
            onSuccess: () => {
                setShowModal(false);
                reset();
                setSelectedStore('');
                clearErrors();
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl leading-tight" style={{ color: 'var(--cds-text-primary)' }}>Maintenance &amp; Repair History</h2>}
        >
            <Head title="Maintenance Tracking" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold" style={{ color: 'var(--cds-text-primary)' }}>Asset Maintenance Tracking</h3>
                                <p className="text-sm mt-1" style={{ color: 'var(--cds-text-secondary)' }}>
                                    Review the time in use and repair frequency for all assets.
                                </p>
                            </div>
                            <Button renderIcon={Add} onClick={() => setShowModal(true)}>Log Maintenance</Button>
                        </div>

                        <Modal
                            open={showModal}
                            modalHeading="Send Asset to Maintenance"
                            primaryButtonText={processing ? 'Saving...' : 'Send to Maintenance'}
                            secondaryButtonText="Cancel"
                            onRequestClose={() => { setShowModal(false); reset(); setSelectedStore(''); clearErrors() }}
                            onRequestSubmit={handleSubmit}
                            primaryButtonDisabled={processing || !data.asset_id}
                        >
                            <div className="space-y-4">
                                <Select
                                    id="store_id"
                                    labelText="Select Store"
                                    value={selectedStore}
                                    onChange={(e) => {
                                        setSelectedStore(e.target.value);
                                        setData('asset_id', '');
                                    }}
                                    className="mb-4"
                                >
                                    <SelectItem value="" text="-- Please select a store --" />
                                    {stores && stores.map(s => (
                                        <SelectItem key={s.id} value={s.id} text={s.name} />
                                    ))}
                                </Select>

                                <Select
                                    id="asset_id"
                                    labelText="Select Asset"
                                    value={data.asset_id}
                                    onChange={(e) => setData('asset_id', e.target.value)}
                                    disabled={!selectedStore}
                                    invalid={!!errors.asset_id}
                                    invalidText={errors.asset_id}
                                    className="mb-4"
                                >
                                    <SelectItem value="" text="-- Please select an asset --" />
                                    {filteredAssets.map(a => (
                                        <SelectItem key={a.id} value={a.id} text={`${a.name} (${a.barcode})`} />
                                    ))}
                                </Select>

                                <Select
                                    id="mt"
                                    labelText="Maintenance Type"
                                    value={data.maintenance_type}
                                    onChange={(e) => setData('maintenance_type', e.target.value)}
                                    className="mb-4"
                                >
                                    <SelectItem value="Preventive" text="Preventive" />
                                    <SelectItem value="Corrective" text="Corrective" />
                                    <SelectItem value="Emergency" text="Emergency" />
                                </Select>

                                <TextArea
                                    id="issue"
                                    labelText="Description / Issue"
                                    value={data.issue_description}
                                    onChange={e => setData('issue_description', e.target.value)}
                                    invalid={!!errors.issue_description}
                                    invalidText={errors.issue_description}
                                    rows={3}
                                    className="mb-4"
                                />

                                <TextInput
                                    id="vendor"
                                    labelText="Vendor Name (Optional)"
                                    value={data.vendor_name}
                                    onChange={e => setData('vendor_name', e.target.value)}
                                    className="mb-4"
                                />

                                <TextInput
                                    id="sdate"
                                    type="date"
                                    labelText="Scheduled Date (Optional)"
                                    value={data.scheduled_date}
                                    onChange={e => setData('scheduled_date', e.target.value)}
                                />
                            </div>
                        </Modal>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Asset</TableHeader>
                                    <TableHeader>Status &amp; Condition</TableHeader>
                                    <TableHeader>Time in Use</TableHeader>
                                    <TableHeader>Times Repaired</TableHeader>
                                    <TableHeader>Actions</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {assets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8" style={{ color: 'var(--cds-text-secondary)' }}>
                                            No assets found in the system.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    assets.map((asset) => (
                                        <TableRow key={asset.id}>
                                            <TableCell>
                                                <div className="font-medium" style={{ color: 'var(--cds-text-primary)' }}>{asset.name}</div>
                                                <div className="text-xs mt-0.5" style={{ color: 'var(--cds-text-secondary)' }}>
                                                    SN: {asset.serial_number || 'N/A'} &bull; {asset.barcode}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Tag type={statusTag(asset.status)}>{asset.status}</Tag>
                                                <span className="text-sm ml-2" style={{ color: 'var(--cds-text-secondary)' }}>{asset.condition}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1" style={{ color: 'var(--cds-text-secondary)' }}>
                                                    <Time size={16} style={{ color: 'var(--cds-text-placeholder)' }} />
                                                    {asset.time_in_use}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Tag type="blue">{asset.repair_count}</Tag>
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={route('maintenance.show', asset.id)}
                                                    className="text-xs font-medium"
                                                    style={{ color: 'var(--cds-link-primary)' }}
                                                >
                                                    View History
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
