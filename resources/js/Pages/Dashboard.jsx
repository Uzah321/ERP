import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';
import TransferModal from '@/Components/TransferModal';
import MaintenanceModal from '@/Components/MaintenanceModal';
import MaintenanceCompleteModal from '@/Components/MaintenanceCompleteModal';
import InputError from '@/Components/InputError';

import { router } from '@inertiajs/react';

export default function Dashboard({ auth, assets, department, categories, locations, all_departments }) {
    const [transferringAsset, setTransferringAsset] = useState(null);
    const [maintainingAsset, setMaintainingAsset] = useState(null);
    const [completingMaintenanceAsset, setCompletingMaintenanceAsset] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        serial_number: '',
        category_id: '',
        location_id: '',
        purchase_cost: '',
        purchase_date: '',
        condition: 'New',
        status: 'Pending',
        description: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('assets.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            header={
    <div className="flex items-center gap-3">
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h2 className="font-bold text-2xl text-gray-800 leading-tight tracking-tight">
            {department ? department.name : 'Simbisa'} <span className="text-indigo-600 font-medium text-lg ml-1">| Asset Registry</span>
        </h2>
    </div>
}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-[90rem] sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">
                    
                    {/* LEFT SIDE: Complex ERP Form */}
                    <div className="w-full lg:w-1/3 bg-white p-6 shadow-sm sm:rounded-lg h-fit">
                        <h3 className="text-lg font-bold mb-4 border-b pb-2">Phase 1: Procurement & Registration</h3>
                        <form onSubmit={submit} className="space-y-4">
                            
                            {/* GENERAL INFO */}
                            <div>
                                <InputLabel htmlFor="name" value="Asset Name" />
                                <TextInput id="name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="category_id" value="Category" />
                                    <select id="category_id" className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} required>
                                        <option value="">Select Category</option>
                                        {categories && categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <InputError message={errors.category_id} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="location_id" value="Location" />
                                    <select id="location_id" className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" value={data.location_id} onChange={(e) => setData('location_id', e.target.value)} required>
                                        <option value="">Select Location</option>
                                        {locations && locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                    <InputError message={errors.location_id} className="mt-2" />
                                </div>
                            </div>

                            {/* PURCHASE INFO */}
                            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Purchase Details</h4>
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <div>
                                        <InputLabel htmlFor="purchase_cost" value="Cost (USD)" />
                                        <TextInput type="number" step="0.01" id="purchase_cost" className="mt-1 block w-full" value={data.purchase_cost} onChange={(e) => setData('purchase_cost', e.target.value)} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="purchase_date" value="Purchase Date" />
                                        <TextInput type="date" id="purchase_date" className="mt-1 block w-full" value={data.purchase_date} onChange={(e) => setData('purchase_date', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* IDENTIFICATION & STATUS */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="serial_number" value="Serial Number" />
                                    <TextInput id="serial_number" className="mt-1 block w-full" value={data.serial_number} onChange={(e) => setData('serial_number', e.target.value)} />
                                    <InputError message={errors.serial_number} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="condition" value="Initial Condition" />
                                    <select id="condition" className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" value={data.condition} onChange={(e) => setData('condition', e.target.value)} required>
                                        <option value="New">New</option>
                                        <option value="Good">Good</option>
                                        <option value="Fair">Fair</option>
                                    </select>
                                </div>
                            </div>

                            <PrimaryButton disabled={processing} className="w-full justify-center mt-4">
                                Register Asset and Generate Barcode
                            </PrimaryButton>
                        </form>
                    </div>

                    {/* RIGHT SIDE: Table */}
                    <div className="w-full lg:w-2/3 bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="text-lg font-bold mb-4">Department Asset Database</h3>
                        
                        {assets && assets.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="py-3 px-2">Barcode</th>
                                            <th className="py-3 px-2">Name</th>
                                            <th className="py-3 px-2">Category</th>
                                            <th className="py-3 px-2">Location</th>
                                            <th className="py-3 px-2">Condition</th>
                                            <th className="py-3 px-2">Status</th>
                                            <th className="py-3 px-2 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assets.map((asset) => (
                                            <tr key={asset.id} className="border-b border-gray-100 hover:bg-indigo-50/30 transition-colors duration-150">
                                                <td className="py-3 px-2 font-mono font-bold text-indigo-600">{asset.barcode}</td>
                                                <td className="py-3 px-2 font-semibold">{asset.name}</td>
                                                <td className="py-3 px-2 text-gray-600">{asset.category?.name}</td>
                                                <td className="py-3 px-2 text-gray-600">{asset.location?.name}</td>
                                                <td className="py-3 px-2">{asset.condition}</td>
                                                <td className="py-3 px-2">
    <span className={"px-2 py-1 text-xs rounded-full font-semibold " + 
        (asset.status === 'Active' ? 'bg-green-100 text-green-800' : 
         asset.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800' : 
         asset.status === 'Decommissioned' ? 'bg-orange-100 text-orange-800' : 
         asset.status === 'Disposed' ? 'bg-red-100 text-red-800' : 
         'bg-blue-100 text-blue-800')}>
        {asset.status}
    </span>
</td>
<td className="py-3 px-2 text-right">
    <div className="flex justify-end gap-2 items-center flex-wrap">
        {['Pending', 'Active'].includes(asset.status) && (
            <button onClick={() => setTransferringAsset(asset)} className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs rounded border border-indigo-200 shadow-sm transition">Transfer</button>
        )}
        
        {['Pending', 'Active'].includes(asset.status) && (
            <button onClick={() => setMaintainingAsset(asset)} className="px-2 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-xs rounded border border-yellow-200 shadow-sm transition">Repair</button>
        )}
        
        {asset.status === 'Under Maintenance' && (
            <button onClick={() => setCompletingMaintenanceAsset(asset)} className="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs rounded border border-green-200 shadow-sm transition">Finish Repair</button>
        )}
        
        {['Pending', 'Active'].includes(asset.status) && (
            <button onClick={() => { if(confirm('Decommission this asset moving it out of use?')) router.post(route('assets.decommission', asset.id)) }} className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs rounded border border-orange-200 shadow-sm transition">Decommission</button>
        )}
        
        {asset.status === 'Decommissioned' && (
            <>
                <button onClick={() => {
                    const method = prompt('Disposal Method? (Sold, Donated, Trashed, Recycled)');
                    if(!method) return;
                    const reason = prompt('Reason for disposal?');
                    if(method && reason) {
                        router.post(route('assets.dispose', asset.id), { method, reason, recovery_amount: 0 });
                    }
                }} className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs rounded border border-red-200 shadow-sm transition">Dispose</button>
                
                <button onClick={() => {
                    if(confirm('Are you sure you want to Archive this asset? It will be removed from the active lists.')) {
                        router.post(route('assets.archive', asset.id));
                    }
                }} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded border border-gray-300 shadow-sm transition">Archive</button>
            </>
        )}
    </div>
</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-gray-50 border border-dashed rounded-lg">
                                <p className="text-gray-500">No assets registered yet. Use the form to log your first purchase!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
                        {transferringAsset && (
                <TransferModal 
                    asset={transferringAsset} 
                    departments={all_departments} 
                    locations={locations} 
                    onClose={() => setTransferringAsset(null)} 
                />
            )}
            {maintainingAsset && (
                <MaintenanceModal 
                    asset={maintainingAsset} 
                    onClose={() => setMaintainingAsset(null)} 
                />
            )}
            {completingMaintenanceAsset && (
                <MaintenanceCompleteModal 
                    asset={completingMaintenanceAsset} 
                    onClose={() => setCompletingMaintenanceAsset(null)} 
                />
            )}
        </AuthenticatedLayout>
    );
}












