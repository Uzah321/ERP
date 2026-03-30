import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function TransferModal({ asset, departments, locations, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        target_department_id: '',
        target_location_id: '',
        reason: '',
        document: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('transfers.store', asset.id), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal show={true} onClose={onClose}>
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    Transfer Asset: {asset.name} ({asset.barcode})
                </h2>

                <div className="mt-4">
                    <InputLabel htmlFor="target_department_id" value="Target Department" />
                    <select
                        id="target_department_id"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        value={data.target_department_id}
                        onChange={(e) => setData('target_department_id', e.target.value)}
                        required
                    >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                    <InputError message={errors.target_department_id} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="target_location_id" value="Target Location" />
                    <select
                        id="target_location_id"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        value={data.target_location_id}
                        onChange={(e) => setData('target_location_id', e.target.value)}
                        required
                    >
                        <option value="">Select Location</option>
                        {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                    <InputError message={errors.target_location_id} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="reason" value="Transfer Reason" />
                    <textarea
                        id="reason"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        value={data.reason}
                        onChange={(e) => setData('reason', e.target.value)}
                        required
                        rows="3"
                    ></textarea>
                    <InputError message={errors.reason} className="mt-2" />
                </div>
                
                <div className="mt-4">
                    <InputLabel htmlFor="document" value="Signed Document (PDF/Image) - Optional" />
                    <input
                        id="document"
                        type="file"
                        className="mt-1 block w-full text-sm text-gray-500"
                        onChange={(e) => setData('document', e.target.files[0])}
                    />
                    <InputError message={errors.document} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton className="ms-3" disabled={processing}>
                        Request Transfer
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
