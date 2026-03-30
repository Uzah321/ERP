import { useForm } from '@inertiajs/react';
import {
    ComposedModal, ModalHeader, ModalBody, ModalFooter,
    Select, SelectItem, TextArea, Button, FileUploader,
} from '@carbon/react';

export default function TransferModal({ asset, departments, locations, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        target_department_id: '',
        target_location_id: '',
        reason: '',
        document: null,
    });

    const submit = () => {
        post(route('transfers.store', asset.id), {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <ComposedModal open onClose={onClose} size="sm">
            <ModalHeader title={`Transfer Asset: ${asset.name} (${asset.barcode})`} />
            <ModalBody>
                <Select
                    id="target_department_id"
                    labelText="Target Department"
                    value={data.target_department_id}
                    onChange={(e) => setData('target_department_id', e.target.value)}
                    required
                    invalid={!!errors.target_department_id}
                    invalidText={errors.target_department_id}
                >
                    <SelectItem value="" text="Select Department" />
                    {departments.map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)} text={dept.name} />
                    ))}
                </Select>

                <div style={{ marginTop: '1rem' }}>
                    <Select
                        id="target_location_id"
                        labelText="Target Location (Deploy)"
                        value={data.target_location_id}
                        onChange={(e) => setData('target_location_id', e.target.value)}
                        required
                        invalid={!!errors.target_location_id}
                        invalidText={errors.target_location_id}
                    >
                        <SelectItem value="" text="Select Location" />
                        {locations.map((loc) => (
                            <SelectItem key={loc.id} value={String(loc.id)} text={loc.name} />
                        ))}
                    </Select>
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <TextArea
                        id="reason"
                        labelText="Transfer Reason"
                        value={data.reason}
                        onChange={(e) => setData('reason', e.target.value)}
                        rows={3}
                        required
                        invalid={!!errors.reason}
                        invalidText={errors.reason}
                    />
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <FileUploader
                        labelTitle="Signed Document (PDF/Image) — Optional"
                        labelDescription="Max file size: 10MB"
                        buttonLabel="Add file"
                        accept={['.pdf', '.png', '.jpg', '.jpeg']}
                        onChange={(e) => setData('document', e.target.files[0])}
                        invalid={!!errors.document}
                        invalidText={errors.document}
                    />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button kind="secondary" onClick={onClose}>Cancel</Button>
                <Button kind="primary" onClick={submit} disabled={processing}>Request Transfer</Button>
            </ModalFooter>
        </ComposedModal>
    );
}
