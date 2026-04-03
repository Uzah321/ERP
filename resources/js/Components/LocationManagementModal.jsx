import { useEffect, useRef, useId } from 'react';
import {
    ComposedModal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Select,
    SelectItem,
    TextArea,
    TextInput,
} from '@carbon/react';

export default function LocationManagementModal({
    open,
    modalHeading,
    primaryButtonText,
    secondaryButtonText,
    processing,
    data,
    setData,
    errors,
    complexes,
    onRequestClose,
    onRequestSubmit,
}) {
    const nameInputRef = useRef(null);
    const idPrefix = useId().replace(/[^A-Za-z0-9_-]/g, '');

    useEffect(() => {
        if (!open) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            nameInputRef.current?.focus?.();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [open]);

    return (
        <ComposedModal open={open} onClose={onRequestClose}>
            <ModalHeader title={modalHeading} />
            <ModalBody>
                <div style={{ display: 'grid', gap: '1rem', paddingTop: '1rem' }}>
                    <Select
                        id={`${idPrefix}-location-type`}
                        labelText="Location Type"
                        value={data.type}
                        onChange={(event) => setData((current) => ({ ...current, type: event.target.value, parent_id: event.target.value === 'store' ? current.parent_id : '' }))}
                        invalid={!!errors.type}
                        invalidText={errors.type}
                    >
                        <SelectItem value="complex" text="Complex" />
                        <SelectItem value="store" text="Store / Shop" />
                    </Select>

                    {data.type === 'store' && (
                        <Select
                            id={`${idPrefix}-parent-id`}
                            labelText="Parent Complex"
                            value={data.parent_id}
                            onChange={(event) => setData('parent_id', event.target.value)}
                            invalid={!!errors.parent_id}
                            invalidText={errors.parent_id}
                        >
                            <SelectItem value="" text="Select complex" />
                            {complexes.map((complex) => (
                                <SelectItem key={complex.id} value={String(complex.id)} text={complex.name} />
                            ))}
                        </Select>
                    )}

                    <TextInput
                        id={`${idPrefix}-location-name`}
                        ref={nameInputRef}
                        labelText={data.type === 'complex' ? 'Complex Name' : 'Store Name'}
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        invalid={!!errors.name}
                        invalidText={errors.name}
                    />
                    <TextArea
                        id={`${idPrefix}-location-address`}
                        labelText="Address / Description"
                        value={data.address}
                        onChange={(event) => setData('address', event.target.value)}
                        invalid={!!errors.address}
                        invalidText={errors.address}
                        rows={3}
                    />
                </div>
            </ModalBody>
            <ModalFooter
                primaryButtonText={primaryButtonText}
                secondaryButtonText={secondaryButtonText}
                onRequestSubmit={onRequestSubmit}
                primaryButtonDisabled={processing}
            />
        </ComposedModal>
    );
}
