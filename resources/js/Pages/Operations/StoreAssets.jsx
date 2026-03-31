import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Button,
    Modal,
    OverflowMenu,
    OverflowMenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tile,
} from '@carbon/react';
import CreateAssetModal from '@/Components/CreateAssetModal';
import EditAssetModal from '@/Components/EditAssetModal';

export default function StoreAssets({ auth, complex, store, assets, categories, complexes }) {
    const isAdmin = auth.user.role === 'admin';
    const [showCreate, setShowCreate] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [confirmArchive, setConfirmArchive] = useState(null);
    const redirectTo = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : route('store-management.assets', store.id);

    const archiveAsset = () => {
        router.post(route('assets.archive', confirmArchive.id), {}, {
            onSuccess: () => setConfirmArchive(null),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${store.name} Assets`} />

            <div className="space-y-6">
                <Tile style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>Operations / Stores</p>
                            <h1 style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', fontWeight: 600 }}>{store.name}</h1>
                            <p style={{ margin: '0.75rem 0 0', color: 'var(--cds-text-secondary)' }}>{complex?.name || 'No complex assigned'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {isAdmin && <Button kind="primary" size="sm" onClick={() => setShowCreate(true)}>New Asset</Button>}
                            {complex && <Button as={Link} href={route('store-management.stores', complex.id)} kind="ghost" size="sm">Back to Stores</Button>}
                            <Button as={Link} href={route('store-management.index')} kind="ghost" size="sm">Back to Complexes</Button>
                        </div>
                    </div>
                </Tile>

                <Tile>
                    <Table size="lg" useZebraStyles>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Barcode</TableHeader>
                                <TableHeader>Asset</TableHeader>
                                <TableHeader>Category</TableHeader>
                                <TableHeader>Department</TableHeader>
                                <TableHeader>Complex</TableHeader>
                                <TableHeader>Store</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {assets.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} style={{ textAlign: 'center', color: 'var(--cds-text-secondary)', padding: '2rem' }}>
                                        No assets are assigned to this store yet.
                                    </TableCell>
                                </TableRow>
                            ) : assets.data.map((asset) => (
                                <TableRow key={asset.id}>
                                    <TableCell><code>{asset.barcode}</code></TableCell>
                                    <TableCell>{asset.name}</TableCell>
                                    <TableCell>{asset.category?.name || '—'}</TableCell>
                                    <TableCell>{asset.department?.name || '—'}</TableCell>
                                    <TableCell>{asset.complex?.name || '—'}</TableCell>
                                    <TableCell>{asset.store?.name || '—'}</TableCell>
                                    <TableCell>{asset.status}</TableCell>
                                    <TableCell style={{ width: '1%' }}>
                                        <OverflowMenu flipped iconDescription="Asset actions">
                                            {isAdmin && <OverflowMenuItem itemText="Edit asset" onClick={() => setEditingAsset(asset)} />}
                                            {isAdmin && <OverflowMenuItem hasDivider isDelete itemText="Archive asset" onClick={() => setConfirmArchive(asset)} />}
                                        </OverflowMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Tile>

                {isAdmin && showCreate && (
                    <CreateAssetModal
                        onClose={() => setShowCreate(false)}
                        categories={categories}
                        complexes={complexes}
                        initialComplexId={complex?.id}
                        initialStoreId={store.id}
                        redirectTo={redirectTo}
                    />
                )}

                {isAdmin && editingAsset && (
                    <EditAssetModal
                        asset={editingAsset}
                        onClose={() => setEditingAsset(null)}
                        categories={categories}
                        complexes={complexes}
                        redirectTo={redirectTo}
                    />
                )}

                <Modal
                    open={!!confirmArchive}
                    danger
                    modalHeading="Archive Asset"
                    primaryButtonText="Archive"
                    secondaryButtonText="Cancel"
                    onRequestClose={() => setConfirmArchive(null)}
                    onRequestSubmit={archiveAsset}
                >
                    {confirmArchive && <p>Archive {confirmArchive.name}? It will be hidden from active views.</p>}
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}