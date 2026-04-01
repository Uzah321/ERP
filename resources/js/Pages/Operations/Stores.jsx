import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, InlineNotification, Modal, OverflowMenu, OverflowMenuItem, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tile } from '@carbon/react';
import LocationManagementModal from '@/Components/LocationManagementModal';

export default function Stores({ auth, complex, complexes, stores, flash }) {
    const canManageLocations = ['admin', 'executive'].includes(auth.user.role);
    const [showCreate, setShowCreate] = useState(false);
    const [editingStore, setEditingStore] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'store',
        name: '',
        address: '',
        parent_id: String(complex.id),
    });

    const openCreate = () => {
        reset();
        setData({ type: 'store', name: '', address: '', parent_id: String(complex.id) });
        setShowCreate(true);
    };

    const closeCreate = () => setShowCreate(false);

    const openEdit = (store) => {
        setData({ type: 'store', name: store.name, address: store.address || '', parent_id: String(complex.id) });
        setEditingStore(store);
    };

    const closeEdit = () => setEditingStore(null);

    const submitCreate = (event) => {
        event.preventDefault();
        post(route('admin.locations.store'), { onSuccess: closeCreate });
    };

    const submitEdit = (event) => {
        event.preventDefault();
        router.put(route('admin.locations.update', editingStore.id), data, { onSuccess: closeEdit });
    };

    const destroyStore = () => {
        router.delete(route('admin.locations.destroy', confirmDelete.id), {
            onSuccess: () => setConfirmDelete(null),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${complex.name} Stores`} />

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
                            <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>Operations / Complexes</p>
                            <h1 style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', fontWeight: 600 }}>{complex.name}</h1>
                            <p style={{ margin: '0.75rem 0 0', color: 'var(--cds-text-secondary)' }}>{complex.address || 'No address recorded.'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <Button as={Link} href={route('store-management.index')} kind="ghost" size="sm">Back to Complexes</Button>
                            {canManageLocations && <Button kind="primary" size="sm" onClick={openCreate}>Add Store</Button>}
                        </div>
                    </div>
                </Tile>

                <Tile>
                    <Table size="lg" useZebraStyles>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Store</TableHeader>
                                <TableHeader>Address</TableHeader>
                                <TableHeader>Assets</TableHeader>
                                <TableHeader />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stores.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} style={{ color: 'var(--cds-text-secondary)', textAlign: 'center' }}>No stores have been added to this complex yet.</TableCell>
                                </TableRow>
                            ) : stores.map((store) => (
                                <TableRow key={store.id}>
                                    <TableCell>
                                        <Link href={route('store-management.assets', store.id)} style={{ fontWeight: 600, color: 'var(--cds-link-primary)', textDecoration: 'none' }}>{store.name}</Link>
                                    </TableCell>
                                    <TableCell>{store.address || 'No address recorded.'}</TableCell>
                                    <TableCell>{store.assets_as_store_count ?? 0}</TableCell>
                                    <TableCell style={{ width: '1%' }}>
                                        <OverflowMenu flipped iconDescription="Store actions">
                                            <OverflowMenuItem itemText="View assets" onClick={() => router.get(route('store-management.assets', store.id))} />
                                            {canManageLocations && <OverflowMenuItem itemText="Edit store" onClick={() => openEdit(store)} />}
                                            {canManageLocations && <OverflowMenuItem hasDivider isDelete itemText="Delete store" onClick={() => setConfirmDelete(store)} />}
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
                    modalHeading="New Store"
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
                    open={!!editingStore}
                    modalHeading="Edit Store"
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
                modalHeading="Delete Store"
                primaryButtonText="Delete"
                secondaryButtonText="Cancel"
                onRequestClose={() => setConfirmDelete(null)}
                onRequestSubmit={destroyStore}
            >
                {confirmDelete && <p>Delete {confirmDelete.name}? This will fail if assets are still attached.</p>}
            </Modal>
        </AuthenticatedLayout>
    );
}