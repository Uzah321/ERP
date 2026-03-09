import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function MaintenanceCompleteModal({ asset, onClose }) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        cost: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('maintenance.update', asset.id), {
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
                    Complete Maintenance: {asset.name} ({asset.barcode})
                </h2>

                <div className="mt-4">
                    <InputLabel htmlFor="cost" value="Repair Cost ($) - Optional" />
                    <input
                        id="cost"
                        type="number"
                        step="0.01"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        value={data.cost}
                        onChange={(e) => setData('cost', e.target.value)}
                    />
                    <InputError message={errors.cost} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="notes" value="Post-Repair Notes (Optional)" />
                    <textarea
                        id="notes"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        rows="3"
                    ></textarea>
                    <InputError message={errors.notes} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton className="ms-3 bg-green-600 hover:bg-green-700" disabled={processing}>
                        Mark as Active
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
