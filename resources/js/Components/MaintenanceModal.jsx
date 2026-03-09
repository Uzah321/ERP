import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function MaintenanceModal({ asset, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        issue_description: '',
        vendor_name: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('maintenance.store', asset.id), {
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
                    Send to Maintenance: {asset.name} ({asset.barcode})
                </h2>

                <div className="mt-4">
                    <InputLabel htmlFor="issue_description" value="Issue Description" />
                    <textarea
                        id="issue_description"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        value={data.issue_description}
                        onChange={(e) => setData('issue_description', e.target.value)}
                        required
                        rows="3"
                        placeholder="What is wrong with the asset?"
                    ></textarea>
                    <InputError message={errors.issue_description} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="vendor_name" value="Vendor / Repairer (Optional)" />
                    <input
                        id="vendor_name"
                        type="text"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        value={data.vendor_name}
                        onChange={(e) => setData('vendor_name', e.target.value)}
                        placeholder="e.g. Dell Service Center"
                    />
                    <InputError message={errors.vendor_name} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton className="ms-3 bg-yellow-600 hover:bg-yellow-700" disabled={processing}>
                        Log for Repair
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
