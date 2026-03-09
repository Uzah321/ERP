import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';

export default function Audit({ auth, recent_audits }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        barcode: '',
    });
    const [successMsg, setSuccessMsg] = useState('');
    const inputRef = useRef();

    useEffect(() => {
        inputRef.current.focus();
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('audit.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMsg('Successfully audited: ' + data.barcode);
                reset('barcode');
                clearErrors();
                setTimeout(() => setSuccessMsg(''), 3000);
                inputRef.current.focus();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Physical Asset Audit</h2>}
        >
            <Head title="Asset Audit" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">
                    
                    <div className="w-full md:w-1/3 bg-white p-6 shadow-sm sm:rounded-lg h-fit">
                        <h3 className="text-lg font-bold mb-4">Scan Barcode</h3>
                        <p className="text-sm text-gray-600 mb-6">Use a barcode scanner or manually type the asset tag to verify physical presence.</p>
                        
                        {successMsg && (
                            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded rounded-md text-sm font-bold">
                                {successMsg}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div className="mb-4">
                                <InputLabel htmlFor="barcode" value="Asset Barcode (e.g. SB-2026-XXXXX)" />
                                <TextInput
                                    id="barcode"
                                    type="text"
                                    className="mt-1 block w-full text-lg p-3"
                                    value={data.barcode}
                                    onChange={(e) => setData('barcode', e.target.value)}
                                    ref={inputRef}
                                    autoComplete="off"
                                />
                                <InputError message={errors.barcode} className="mt-2" />
                            </div>
                            <PrimaryButton className="w-full justify-center py-3 text-lg" disabled={processing}>
                                Verify Asset
                            </PrimaryButton>
                        </form>
                    </div>

                    <div className="w-full md:w-2/3 bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="text-lg font-bold mb-4 border-b pb-2">Audited Today</h3>
                        {recent_audits.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="py-2 px-3">Barcode</th>
                                            <th className="py-2 px-3">Name</th>
                                            <th className="py-2 px-3">Location</th>
                                            <th className="py-2 px-3">Status</th>
                                            <th className="py-2 px-3">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recent_audits.map(asset => (
                                            <tr key={asset.id} className="border-b">
                                                <td className="py-2 px-3 font-mono font-bold text-indigo-600">{asset.barcode}</td>
                                                <td className="py-2 px-3">{asset.name}</td>
                                                <td className="py-2 px-3">{asset.location?.name}</td>
                                                <td className="py-2 px-3">
                                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Verified</span>
                                                </td>
                                                <td className="py-2 px-3 text-xs text-gray-500">
                                                    {new Date(asset.last_audited_at).toLocaleTimeString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No assets have been audited today.</p>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
