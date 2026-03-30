import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    ComposedModal, ModalHeader, ModalBody, ModalFooter,
    Select, SelectItem, TextInput, TextArea, NumberInput, Button,
} from '@carbon/react';
import { Add, TrashCan } from '@carbon/icons-react';

const defaultItem = () => ({
    asset_type: '',
    for_whom: '',
    position: '',
    requirements: '',
    quantity: 1,
});

const fallbackSpecs = {
    manager: { laptop: '32GB RAM, 1TB storage, Core i7' },
    hod:     { laptop: '32GB RAM, 1TB storage, Core i7' },
    staff:   { laptop: '16GB RAM, 500GB storage, Core i5' },
};
const fallbackPositions = [
    { value: 'manager', label: 'Manager' },
    { value: 'hod',     label: 'Head of Department (HOD)' },
    { value: 'staff',   label: 'Staff' },
    { value: 'other',   label: 'Other' },
];

export default function AssetRequestModal({ show, onClose, departments, vendorCategories, assetCategories }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        target_department_id: '',
        asset_category: '',
        items: [defaultItem()],
    });

    const [positionSpecs, setPositionSpecs] = useState({});
    const [availablePositions, setAvailablePositions] = useState([]);
    const categoryOptions = vendorCategories ?? assetCategories ?? [];

    useEffect(() => {
        if (show) {
            fetch(route('position-specs.all'))
                .then(res => res.json())
                .then(fetched => {
                    setPositionSpecs(fetched);
                    const positions = Object.keys(fetched);
                    setAvailablePositions(
                        positions.length > 0
                            ? positions.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))
                            : fallbackPositions
                    );
                })
                .catch(() => setAvailablePositions(fallbackPositions));
        }
    }, [show]);

    const getSpecs = (position, assetType) => {
        if (!position) return null;
        const typeLower = (assetType ?? '').toLowerCase().trim();
        const src = positionSpecs[position] ?? fallbackSpecs[position];
        if (!src) return null;
        for (const [k, v] of Object.entries(src)) {
            if (!typeLower || typeLower.includes(k.toLowerCase()) || k.toLowerCase().includes(typeLower)) return v;
        }
        return Object.values(src)[0] ?? null;
    };

    const updateItem = (index, field, value) => {
        setData('items', data.items.map((item, i) => {
            if (i !== index) return item;
            const updated = { ...item, [field]: value };
            if (field === 'position' || field === 'asset_type') {
                const specs = getSpecs(
                    field === 'position' ? value : item.position,
                    field === 'asset_type' ? value : item.asset_type,
                );
                if (specs) updated.requirements = specs;
            }
            return updated;
        }));
    };

    const submit = () => {
        post(route('asset-requests.store'), {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <ComposedModal open={show} onClose={onClose} size="md">
            <ModalHeader title="Submit New Asset Request" />
            <ModalBody style={{ paddingBottom: '1rem' }}>

                <Select
                    id="target_department_id"
                    labelText="Responsible Department"
                    value={data.target_department_id}
                    onChange={(e) => setData('target_department_id', e.target.value)}
                    required
                    invalid={!!errors.target_department_id}
                    invalidText={errors.target_department_id}
                >
                    <SelectItem value="" text="Select Department..." />
                    {departments.map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)} text={dept.name} />
                    ))}
                </Select>

                <div style={{ marginTop: '1rem' }}>
                    <Select
                        id="asset_category"
                        labelText="Asset Category"
                        value={data.asset_category}
                        onChange={(e) => setData('asset_category', e.target.value)}
                        required
                        invalid={!!errors.asset_category}
                        invalidText={errors.asset_category}
                    >
                        <SelectItem value="" text="Select Asset Category..." />
                            {categoryOptions.map((cat, i) => (
                            <SelectItem key={i} value={cat} text={cat} />
                        ))}
                    </Select>
                </div>

                {/* Dynamic line items */}
                <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            Asset Items ({data.items.length})
                        </p>
                        <Button kind="ghost" size="sm" renderIcon={Add} onClick={() => setData('items', [...data.items, defaultItem()])}>
                            Add Item
                        </Button>
                    </div>

                    {data.items.map((item, index) => (
                        <div key={index} style={{
                            border: '1px solid var(--cds-border-subtle)',
                            borderRadius: '4px',
                            padding: '1rem',
                            marginBottom: '1rem',
                            background: 'var(--cds-layer-02)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-link-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Item {index + 1}
                                </span>
                                {data.items.length > 1 && (
                                    <Button kind="ghost" size="sm" hasIconOnly renderIcon={TrashCan} iconDescription="Remove item"
                                        onClick={() => setData('items', data.items.filter((_, i) => i !== index))} />
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <TextInput
                                    id={`asset_type_${index}`}
                                    labelText="Asset Type"
                                    value={item.asset_type}
                                    onChange={(e) => updateItem(index, 'asset_type', e.target.value)}
                                    placeholder="e.g. Laptop, Printer"
                                    required
                                    invalid={!!errors[`items.${index}.asset_type`]}
                                    invalidText={errors[`items.${index}.asset_type`]}
                                />
                                <NumberInput
                                    id={`quantity_${index}`}
                                    label="Quantity"
                                    value={item.quantity}
                                    min={1}
                                    onChange={(e, { value }) => updateItem(index, 'quantity', value)}
                                    required
                                    invalid={!!errors[`items.${index}.quantity`]}
                                    invalidText={errors[`items.${index}.quantity`]}
                                />
                            </div>

                            <div style={{ marginTop: '0.75rem' }}>
                                <TextInput
                                    id={`for_whom_${index}`}
                                    labelText="Who is this asset for?"
                                    value={item.for_whom}
                                    onChange={(e) => updateItem(index, 'for_whom', e.target.value)}
                                    placeholder="Person's name, team, or role"
                                    required
                                    invalid={!!errors[`items.${index}.for_whom`]}
                                    invalidText={errors[`items.${index}.for_whom`]}
                                />
                            </div>

                            <div style={{ marginTop: '0.75rem' }}>
                                <Select
                                    id={`position_${index}`}
                                    labelText="Position"
                                    value={item.position}
                                    onChange={(e) => updateItem(index, 'position', e.target.value)}
                                    required
                                    invalid={!!errors[`items.${index}.position`]}
                                    invalidText={errors[`items.${index}.position`]}
                                >
                                    <SelectItem value="" text="Select Position..." />
                                    {availablePositions.map((pos, idx) => (
                                        <SelectItem key={idx} value={pos.value} text={pos.label} />
                                    ))}
                                </Select>
                            </div>

                            <div style={{ marginTop: '0.75rem' }}>
                                <TextArea
                                    id={`requirements_${index}`}
                                    labelText="Specifications / Reason"
                                    value={item.requirements}
                                    onChange={(e) => updateItem(index, 'requirements', e.target.value)}
                                    placeholder="Detailed specifications and justification"
                                    rows={3}
                                    required
                                    invalid={!!errors[`items.${index}.requirements`]}
                                    invalidText={errors[`items.${index}.requirements`]}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </ModalBody>
            <ModalFooter>
                <Button kind="secondary" onClick={onClose} disabled={processing}>Cancel</Button>
                <Button kind="primary" onClick={submit} disabled={processing}>Send Request</Button>
            </ModalFooter>
        </ComposedModal>
    );
}
