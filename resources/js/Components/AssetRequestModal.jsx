import React from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';

export default function AssetRequestModal({ show, onClose, departments }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        target_department_id: '',
        asset_category: '',
        requirements: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('asset-requests.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Submit New Asset Request
                </h2>

                <div className="mt-4">
                    <InputLabel htmlFor="target_department_id" value="Responsible Department (e.g., IT, Operations)" />
                    <select
                        id="target_department_id"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        value={data.target_department_id}
                        onChange={(e) => setData('target_department_id', e.target.value)}
                        required
                    >
                        <option value="">Select Department...</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                    <InputError message={errors.target_department_id} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="asset_category" value="What type of asset do you need?" />
                    <TextInput
                        id="asset_category"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.asset_category}
                        onChange={(e) => setData('asset_category', e.target.value)}
                        placeholder="e.g., Laptop, Vehicle, Printer"
                        required
                    />
                    <InputError message={errors.asset_category} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="requirements" value="Specific Requirements / Reason" />
                    <textarea
                        id="requirements"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        rows="4"
                        value={data.requirements}
                        onChange={(e) => setData('requirements', e.target.value)}
                        placeholder="Please detail the exact specifications needed and why this is requested."
                        required
                    ></textarea>
                    <InputError message={errors.requirements} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        Cancel
                    </SecondaryButton>

                    <PrimaryButton className="ml-3" disabled={processing}>
                        Send Request
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
