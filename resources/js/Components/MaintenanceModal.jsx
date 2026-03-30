import { useForm } from '@inertiajs/react';
import {
    ComposedModal, ModalHeader, ModalBody, ModalFooter,
    TextArea, TextInput, Button,
} from '@carbon/react';

export default function MaintenanceModal({ asset, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        issue_description: '',
        vendor_name: '',
    });

    const submit = (e) => {
        e?.preventDefault();
        post(route('maintenance.store', asset.id), {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <ComposedModal open onClose={onClose} size="sm">
            <ModalHeader title={`Send to Maintenance: ${asset.name} (${asset.barcode})`} />
            <ModalBody>
                <TextArea
                    id="issue_description"
                    labelText="Issue Description"
                    value={data.issue_description}
                    onChange={(e) => setData('issue_description', e.target.value)}
                    placeholder="What is wrong with the asset?"
                    rows={3}
                    required
                    invalid={!!errors.issue_description}
                    invalidText={errors.issue_description}
                />
                <div style={{ marginTop: '1rem' }}>
                    <TextInput
                        id="vendor_name"
                        labelText="Vendor / Repairer (Optional)"
                        value={data.vendor_name}
                        onChange={(e) => setData('vendor_name', e.target.value)}
                        placeholder="e.g. Dell Service Center"
                        invalid={!!errors.vendor_name}
                        invalidText={errors.vendor_name}
                    />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button kind="secondary" onClick={onClose}>Cancel</Button>
                <Button kind="primary" onClick={submit} disabled={processing}>Log for Repair</Button>
            </ModalFooter>
        </ComposedModal>
    );
}
