import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';

const defaultItem = () => ({
    asset_type: '',
    for_whom: '',
    position: '',
    requirements: '',
    quantity: 1,
});

export default function AssetRequestModal({ show, onClose, departments, assetCategories }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        target_department_id: '',
        asset_category: '',
        items: [defaultItem()],
    });

    const [positionSpecs, setPositionSpecs] = useState({});
    const [availablePositions, setAvailablePositions] = useState([]);

    const fallbackSpecs = {
        manager: { laptop: '32GB RAM, 1TB storage, Core i7' },
        hod: { laptop: '32GB RAM, 1TB storage, Core i7' },
        staff: { laptop: '16GB RAM, 500GB storage, Core i5' },
    };
    const fallbackPositions = [
        { value: 'manager', label: 'Manager' },
        { value: 'hod', label: 'Head of Department (HOD)' },
        { value: 'staff', label: 'Staff' },
        { value: 'other', label: 'Other' },
    ];

    useEffect(() => {
        if (show) {
            fetch(route('position-specs.all'))
                .then(res => res.json())
                .then(fetched => {
                    setPositionSpecs(fetched);
                    const positions = Object.keys(fetched);
                    if (positions.length > 0) {
                        setAvailablePositions(positions.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) })));
                    } else {
                        setAvailablePositions(fallbackPositions);
                    }
                })
                .catch(() => setAvailablePositions(fallbackPositions));
        }
    }, [show]);

    const getSpecsForPositionAndType = (position, assetType) => {
        if (!position) return null;
        const typeLower = assetType ? assetType.toLowerCase().trim() : '';

        // Check DB specs first
        if (positionSpecs[position]) {
            if (typeLower) {
                for (const [dbType, specs] of Object.entries(positionSpecs[position])) {
                    if (typeLower.includes(dbType.toLowerCase()) || dbType.toLowerCase().includes(typeLower)) {
                        return specs;
                    }
                }
            }
            // No asset type yet (or no match) — return first available spec for this position
            const firstDbSpecs = Object.values(positionSpecs[position])[0];
            if (firstDbSpecs) return firstDbSpecs;
        }

        // Fallback hardcoded specs
        if (fallbackSpecs[position]) {
            if (typeLower) {
                for (const [fbType, specs] of Object.entries(fallbackSpecs[position])) {
                    if (typeLower.includes(fbType) || fbType.includes(typeLower)) {
                        return specs;
                    }
                }
            }
            const firstFallback = Object.values(fallbackSpecs[position])[0];
            if (firstFallback) return firstFallback;
        }

        return null;
    };

    const updateItem = (index, field, value) => {
        const updatedItems = data.items.map((item, i) => {
            if (i !== index) return item;
            const updated = { ...item, [field]: value };
            if (field === 'position' || field === 'asset_type') {
                const pos = field === 'position' ? value : item.position;
                const type = field === 'asset_type' ? value : item.asset_type;
                const specs = getSpecsForPositionAndType(pos, type);
                if (specs) updated.requirements = specs;
            }
            return updated;
        });
        setData('items', updatedItems);
    };

    const addItem = () => setData('items', [...data.items, defaultItem()]);

    const removeItem = (index) => {
        if (data.items.length === 1) return;
        setData('items', data.items.filter((_, i) => i !== index));
    };

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
            <form onSubmit={submit} className="p-6" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Submit New Asset Request
                </h2>

                {/* Shared fields */}
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
                    <InputLabel htmlFor="asset_category" value="Asset Category" />
                    <select
                        id="asset_category"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        value={data.asset_category}
                        onChange={(e) => setData('asset_category', e.target.value)}
                        required
                    >
                        <option value="">Select Asset Category...</option>
                        {assetCategories?.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))}
                    </select>
                    <InputError message={errors.asset_category} className="mt-2" />
                </div>

                {/* Dynamic item list */}
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700">
                            Asset Items
                            <span className="ml-2 text-xs font-normal text-gray-500">
                                ({data.items.length} item{data.items.length !== 1 ? 's' : ''})
                            </span>
                        </h3>
                        <button
                            type="button"
                            onClick={addItem}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-300 rounded-md hover:bg-indigo-100 transition-colors"
                        >
                            + Add Item
                        </button>
                    </div>

                    {data.items.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                                    Item {index + 1}
                                </span>
                                {data.items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputLabel value="Asset Type" />
                                    <TextInput
                                        className="mt-1 block w-full text-sm"
                                        value={item.asset_type}
                                        onChange={(e) => updateItem(index, 'asset_type', e.target.value)}
                                        placeholder="e.g. Laptop, Printer"
                                        required
                                    />
                                    <InputError message={errors[`items.${index}.asset_type`]} className="mt-1" />
                                </div>
                                <div>
                                    <InputLabel value="Quantity" />
                                    <TextInput
                                        type="number"
                                        className="mt-1 block w-full text-sm"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                                        min="1"
                                        required
                                    />
                                    <InputError message={errors[`items.${index}.quantity`]} className="mt-1" />
                                </div>
                            </div>

                            <div className="mt-3">
                                <InputLabel value="Who is this asset for?" />
                                <TextInput
                                    className="mt-1 block w-full text-sm"
                                    value={item.for_whom}
                                    onChange={(e) => updateItem(index, 'for_whom', e.target.value)}
                                    placeholder="Person's name, team, or role"
                                    required
                                />
                                <InputError message={errors[`items.${index}.for_whom`]} className="mt-1" />
                            </div>

                            <div className="mt-3">
                                <InputLabel value="Position (for IT asset restrictions)" />
                                <select
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                    value={item.position}
                                    onChange={(e) => updateItem(index, 'position', e.target.value)}
                                    required
                                >
                                    <option value="">Select Position...</option>
                                    {availablePositions.map((pos, idx) => (
                                        <option key={idx} value={pos.value}>{pos.label}</option>
                                    ))}
                                </select>
                                <InputError message={errors[`items.${index}.position`]} className="mt-1" />
                            </div>

                            <div className="mt-3">
                                <InputLabel value="Specifications / Reason" />
                                <textarea
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                    rows="3"
                                    value={item.requirements}
                                    onChange={(e) => updateItem(index, 'requirements', e.target.value)}
                                    placeholder="Detailed specifications and justification"
                                    required
                                ></textarea>
                                <InputError message={errors[`items.${index}.requirements`]} className="mt-1" />
                            </div>
                        </div>
                    ))}
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
