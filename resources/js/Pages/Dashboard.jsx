import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateAssetModal from '@/Components/CreateAssetModal';
import EditAssetModal from '@/Components/EditAssetModal';
import AssetRequestModal from '@/Components/AssetRequestModal';

export default function Dashboard({ auth, assets, department, categories, locations, all_departments, vendor_categories, selected_department_id }) {
        const [bulkTransferData, setBulkTransferData] = useState({ target_department_id: '', reason: '' });
        const [bulkTransferErrors, setBulkTransferErrors] = useState({});
        const [bulkTransferProcessing, setBulkTransferProcessing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [selectedAssets, setSelectedAssets] = useState([]);
    const isAdmin = auth.user.role === 'admin';

    const handleDepartmentChange = (e) => {
        const deptId = e.target.value;
        if (deptId) {
            router.get(route('dashboard'), { department_id: deptId }, { preserveState: true });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Asset Master" />
            
            <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden text-sm">
                {/* TOOLBAR */}
                <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm z-10 shrink-0">
                    <div className="flex gap-3">
                        {/* New Asset Button */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            + New Asset
                        </button>
                        {/* Transfer Button */}
                        <button
                            onClick={() => setShowTransferModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium disabled:opacity-50"
                            disabled={selectedAssets.length === 0}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17l4-4m0 0l-4-4m4 4H7" /></svg>
                            Transfer
                        </button>
                        <button onClick={() => setShowRequestModal(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm font-medium">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> Request Order
                        </button>
                        <button onClick={() => router.reload({ only: ['assets'] })} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                            Refresh
                        </button>
                        {/* Bulk Delete Button */}
                        <button
                            onClick={() => {
                                if(selectedAssets.length > 0 && confirm(`Delete ${selectedAssets.length} selected assets?`)) {
                                    router.post(route('assets.bulkDelete'), { asset_ids: selectedAssets });
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm font-medium disabled:opacity-50"
                            disabled={selectedAssets.length === 0}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Delete
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-500 whitespace-nowrap">Department:</label>
                        {isAdmin ? (
                            <select
                                value={selected_department_id || ''}
                                onChange={handleDepartmentChange}
                                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
                            >
                                <option value="">-- Select Department --</option>
                                {(all_departments || []).map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        ) : (
                            <span className="font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                                {department ? department.name : 'AssetLinq ERP'}
                            </span>
                        )}
                    </div>
                </div>

                {/* THE GRID CONTAINER */}
                <div className="flex-1 p-6 overflow-hidden flex flex-col">
                    <div className="bg-white flex-1 border border-gray-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
                        
                        {/* Grid Header */}
                        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex justify-between items-center shrink-0 cursor-default">
                            <h2 className="text-gray-800 font-semibold text-base">Asset Inventory List</h2>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{assets.length} items</span>
                        </div>

                        {/* Grid Data Wrapper */}
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-left whitespace-nowrap border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-5 py-3 border-b border-gray-200">
                                            <input type="checkbox" id="selectAll" onChange={e => {
                                                if (e.target.checked) setSelectedAssets(assets.map(a => a.id));
                                                else setSelectedAssets([]);
                                            }} checked={selectedAssets.length === assets.length && assets.length > 0} />
                                        </th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Barcode</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Serial Number</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Asset Name</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Category</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Location</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Condition</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Status</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Book Value</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs">Warranty</th>
                                        <th className="px-5 py-3 font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-xs text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="p-8 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                                    <span className="text-lg font-medium text-gray-400">No assets found</span>
                                                    <span className="text-sm text-gray-400">Click '+ New Asset' to add your first item</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        assets.map((asset, index) => (
                                            <tr key={asset.id} onDoubleClick={() => setEditingAsset(asset)} className="hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors bg-white">
                                                <td className="px-5 py-3">
                                                    <input type="checkbox" checked={selectedAssets.includes(asset.id)} onChange={e => {
                                                        if (e.target.checked) setSelectedAssets([...selectedAssets, asset.id]);
                                                        else setSelectedAssets(selectedAssets.filter(id => id !== asset.id));
                                                    }} />
                                                </td>
                                                <td className="px-5 py-3 font-mono text-gray-600 text-xs">{asset.barcode}</td>
                                                <td className="px-5 py-3 font-mono text-gray-500 text-xs">{asset.serial_number || '-'}</td>
                                                <td className="px-5 py-3 font-medium text-gray-900">{asset.name}</td>
                                                <td className="px-5 py-3 text-gray-600">{asset.category?.name || '-'}</td>
                                                <td className="px-5 py-3 text-gray-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                                        {asset.location?.name || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-gray-600">{asset.condition}</td>
                                                <td className="px-5 py-3">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        asset.status === 'Active Use' ? 'bg-green-100 text-green-700' :
                                                        asset.status === 'Available' ? 'bg-green-100 text-green-700' :
                                                        asset.status === 'Allocated' ? 'bg-indigo-100 text-indigo-700' :
                                                        asset.status === 'Deployed' ? 'bg-emerald-100 text-emerald-700' :
                                                        asset.status === 'Purchased' ? 'bg-purple-100 text-purple-700' :
                                                        asset.status === 'Registered' ? 'bg-blue-100 text-blue-700' :
                                                        asset.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-700' :
                                                        asset.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-700' :
                                                        asset.status === 'Audit' ? 'bg-orange-100 text-orange-700' :
                                                        asset.status === 'Retired' ? 'bg-gray-300 text-gray-800' :
                                                        asset.status === 'Decommissioned' ? 'bg-gray-200 text-gray-700' :
                                                        asset.status === 'Disposed' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {asset.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-xs">
                                                    {asset.book_value != null
                                                        ? <span className="font-mono text-gray-700">${Number(asset.book_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                        : <span className="text-gray-300">—</span>
                                                    }
                                                </td>
                                                <td className="px-5 py-3">
                                                    {asset.warranty_status === 'active' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>}
                                                    {asset.warranty_status === 'expiring_soon' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Expiring</span>}
                                                    {asset.warranty_status === 'expired' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Expired</span>}
                                                    {asset.warranty_status === 'none' && <span className="text-gray-300 text-xs">—</span>}
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <button onClick={() => setEditingAsset(asset)} className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors" title="Edit">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                        </button>
                                                        <button 
                                                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors" 
                                                            title="Delete"
                                                            onClick={() => {
                                                                if(confirm(`Delete ${asset.name}?`)) router.post(route('assets.archive', asset.id));
                                                            }}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>


            {/* Bulk Transfer Modal */}
            {showTransferModal && (
                <Modal show={showTransferModal} onClose={() => setShowTransferModal(false)}>
                    <form
                        className="p-6"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setBulkTransferProcessing(true);
                            setBulkTransferErrors({});
                            router.post(
                                route('assets.bulkTransfer'),
                                {
                                    asset_ids: selectedAssets,
                                    target_department_id: bulkTransferData.target_department_id,
                                    reason: bulkTransferData.reason,
                                },
                                {
                                    onSuccess: () => {
                                        setShowTransferModal(false);
                                        setBulkTransferData({ target_department_id: '', reason: '' });
                                        setBulkTransferErrors({});
                                        setBulkTransferProcessing(false);
                                        setSelectedAssets([]);
                                    },
                                    onError: (errors) => {
                                        setBulkTransferErrors(errors);
                                        setBulkTransferProcessing(false);
                                    },
                                }
                            );
                        }}
                    >
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Transfer {selectedAssets.length} Assets</h2>
                        <div className="mb-4">
                            <InputLabel htmlFor="target_department_id" value="Target Department" />
                            <select
                                id="target_department_id"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={bulkTransferData.target_department_id}
                                onChange={e => setBulkTransferData({ ...bulkTransferData, target_department_id: e.target.value })}
                                required
                            >
                                <option value="">Select Department</option>
                                {(all_departments || []).map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                            <InputError message={bulkTransferErrors.target_department_id} className="mt-2" />
                        </div>
                        <div className="mb-4">
                            <InputLabel htmlFor="reason" value="Reason for Transfer" />
                            <textarea
                                id="reason"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={bulkTransferData.reason}
                                onChange={e => setBulkTransferData({ ...bulkTransferData, reason: e.target.value })}
                                required
                                rows={3}
                            />
                            <InputError message={bulkTransferErrors.reason} className="mt-2" />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={() => setShowTransferModal(false)}
                                disabled={bulkTransferProcessing}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold disabled:opacity-50"
                                disabled={bulkTransferProcessing}
                            >
                                {bulkTransferProcessing ? 'Transferring...' : 'Transfer'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {showCreateModal && (
                <CreateAssetModal 
                    onClose={() => setShowCreateModal(false)} 
                    categories={categories} 
                    locations={locations} 
                />
            )}

            {showRequestModal && (
                <AssetRequestModal
                    show={showRequestModal}
                    onClose={() => setShowRequestModal(false)}
                    departments={all_departments || []}
                    vendorCategories={vendor_categories || []}
                />
            )}
        </AuthenticatedLayout>
    );
}
