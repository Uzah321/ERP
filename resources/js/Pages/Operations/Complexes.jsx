import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, InlineNotification, Modal, OverflowMenu, OverflowMenuItem, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tile } from '@carbon/react';
import LocationManagementModal from '@/Components/LocationManagementModal';

export default function Complexes({ auth, complexes, flash }) {
    const canManageLocations = ['admin', 'executive'].includes(auth.user.role);
    const [showCreate, setShowCreate] = useState(false);
    const [editingComplex, setEditingComplex] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'complex',
        name: '',
        address: '',
        parent_id: '',
    });

    const openCreate = () => {
        reset();
        setData({ type: 'complex', name: '', address: '', parent_id: '' });
        setShowCreate(true);
    };

    const closeCreate = () => setShowCreate(false);

    const openEdit = (complex) => {
        setData({ type: 'complex', name: complex.name, address: complex.address || '', parent_id: '' });
        setEditingComplex(complex);
    };

    const closeEdit = () => setEditingComplex(null);

    const submitCreate = (event) => {
        event.preventDefault();
        post(route('admin.locations.store'), { onSuccess: closeCreate });
    };

    const submitEdit = (event) => {
        event.preventDefault();
        router.put(route('admin.locations.update', editingComplex.id), data, { onSuccess: closeEdit });
    };

    const destroyComplex = () => {
        router.delete(route('admin.locations.destroy', confirmDelete.id), {
            onSuccess: () => setConfirmDelete(null),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Complexes" />

            <div className="space-y-6">
                {(flash?.success || Object.keys(errors).length > 0) && (
                    <InlineNotification
                        kind={flash?.success ? 'success' : 'error'}
                        title={flash?.success ? 'Success' : 'Error'}
                        subtitle={flash?.success || Object.values(errors)[0]}
                        lowContrast
                        onClose={() => {}}
                    />
                )}

                <Tile style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>Operations</p>
                            <h1 style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', fontWeight: 600 }}>Complexes</h1>
                            <p style={{ margin: '0.75rem 0 0', color: 'var(--cds-text-secondary)' }}>
                                Start with a complex, then open it to manage its stores.
                            </p>
                        </div>
                        {canManageLocations && <Button kind="primary" size="sm" onClick={openCreate}>Add Complex</Button>}
                    </div>
                </Tile>

                <Tile>
                    <Table size="lg" useZebraStyles>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Complex</TableHeader>
                                <TableHeader>Address</TableHeader>
                                <TableHeader>Stores</TableHeader>
                                <TableHeader>Assets</TableHeader>
                                <TableHeader />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {complexes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} style={{ color: 'var(--cds-text-secondary)', textAlign: 'center' }}>No complexes created yet.</TableCell>
                                </TableRow>
                            ) : complexes.map((complex) => (
                                <TableRow key={complex.id}>
                                    <TableCell>
                                        <Link href={route('store-management.stores', complex.id)} style={{ fontWeight: 600, color: 'var(--cds-link-primary)', textDecoration: 'none' }}>{complex.name}</Link>
                                    </TableCell>
                                    <TableCell>{complex.address || 'No address recorded.'}</TableCell>
                                    <TableCell>{complex.stores_count ?? 0}</TableCell>
                                    <TableCell>{complex.assets_as_complex_count ?? 0}</TableCell>
                                    <TableCell style={{ width: '1%' }}>
                                        <OverflowMenu flipped iconDescription="Complex actions">
                                            <OverflowMenuItem itemText="View stores" onClick={() => router.get(route('store-management.stores', complex.id))} />
                                            {canManageLocations && <OverflowMenuItem itemText="Edit complex" onClick={() => openEdit(complex)} />}
                                            {canManageLocations && <OverflowMenuItem hasDivider isDelete itemText="Delete complex" onClick={() => setConfirmDelete(complex)} />}
                                        </OverflowMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Tile>
            </div>

            {canManageLocations && (
                <LocationManagementModal
                    open={showCreate}
                    modalHeading="New Complex"
                    primaryButtonText={processing ? 'Saving…' : 'Save'}
                    secondaryButtonText="Cancel"
                    processing={processing}
                    data={data}
                    setData={setData}
                    errors={errors}
                    complexes={complexes}
                    onRequestClose={closeCreate}
                    onRequestSubmit={submitCreate}
                />
            )}

            {canManageLocations && (
                <LocationManagementModal
                    open={!!editingComplex}
                    modalHeading="Edit Complex"
                    primaryButtonText={processing ? 'Saving...' : 'Save'}
                    secondaryButtonText="Cancel"
                    processing={processing}
                    data={data}
                    setData={setData}
                    errors={errors}
                    complexes={complexes}
                    onRequestClose={closeEdit}
                    onRequestSubmit={submitEdit}
                />
            )}

            <Modal
                open={!!confirmDelete}
                danger
                modalHeading="Delete Complex"
                primaryButtonText="Delete"
                secondaryButtonText="Cancel"
                onRequestClose={() => setConfirmDelete(null)}
                onRequestSubmit={destroyComplex}
            >
                {confirmDelete && <p>Delete {confirmDelete.name}? This will fail if stores or assets are still attached.</p>}
            </Modal>
        </AuthenticatedLayout>
    );
}