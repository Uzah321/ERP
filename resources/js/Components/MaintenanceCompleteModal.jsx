import { useForm } from '@inertiajs/react';
import {
    ComposedModal, ModalHeader, ModalBody, ModalFooter,
    TextInput, TextArea, Button,
} from '@carbon/react';

export default function MaintenanceCompleteModal({ asset, onClose }) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        cost: '',
        notes: '',
    });

    const submit = () => {
        patch(route('maintenance.update', asset.id), {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <ComposedModal open onClose={onClose} size="sm">
            <ModalHeader title={`Complete Maintenance: ${asset.name} (${asset.barcode})`} />
            <ModalBody>
                <TextInput
                    id="cost"
                    labelText="Repair Cost ($) — Optional"
                    type="number"
                    step="0.01"
                    value={data.cost}
                    onChange={(e) => setData('cost', e.target.value)}
                    invalid={!!errors.cost}
                    invalidText={errors.cost}
                />
                <div style={{ marginTop: '1rem' }}>
                    <TextArea
                        id="notes"
                        labelText="Post-Repair Notes (Optional)"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        rows={3}
                        invalid={!!errors.notes}
                        invalidText={errors.notes}
                    />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button kind="secondary" onClick={onClose}>Cancel</Button>
                <Button kind="primary" onClick={submit} disabled={processing}>Mark as Active</Button>
            </ModalFooter>
        </ComposedModal>
    );
}
