import { useForm } from '@inertiajs/react';
import {
    ComposedModal, ModalHeader, ModalBody, ModalFooter,
    TextInput, Select, SelectItem, TextArea, NumberInput,
    FileUploader, Button, Grid, Column,
} from '@carbon/react';

const CONDITIONS = ['New', 'Good', 'Fair', 'Poor'];
const STATUSES = ['Purchased', 'Available', 'Allocated', 'Registered', 'Deployed', 'Active Use', 'Under Maintenance', 'Audit', 'Retired', 'Decommissioned', 'Disposed', 'Archived'];

export default function CreateAssetModal({ onClose, categories, locations }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        serial_number: '',
        category_id: '',
        location_id: '',
        purchase_cost: '',
        purchase_date: '',
        condition: 'New',
        status: 'Purchased',
        description: '',
        depreciation_method: 'straight_line',
        annual_depreciation_rate: '25',
        photo: null,
    });

    const submit = () => {
        post(route('assets.store'), {
            forceFormData: true,
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <ComposedModal open onClose={onClose} size="md">
            <ModalHeader title="Create New Asset" />
            <ModalBody>
                <Grid narrow>
                    <Column sm={4} md={4} lg={8}>
                        <TextInput id="name" labelText="Asset Name *" value={data.name}
                            onChange={e => setData('name', e.target.value)} required
                            invalid={!!errors.name} invalidText={errors.name} />
                    </Column>
                    <Column sm={4} md={4} lg={8}>
                        <TextInput id="serial_number" labelText="Serial Number" value={data.serial_number}
                            onChange={e => setData('serial_number', e.target.value)}
                            invalid={!!errors.serial_number} invalidText={errors.serial_number} />
                    </Column>
                    <Column sm={4} md={4} lg={8}>
                        <Select id="category_id" labelText="Category *" value={data.category_id}
                            onChange={e => setData('category_id', e.target.value)} required
                            invalid={!!errors.category_id} invalidText={errors.category_id}>
                            <SelectItem value="" text="-- Select Category --" />
                            {categories.map(c => <SelectItem key={c.id} value={String(c.id)} text={c.name} />)}
                        </Select>
                    </Column>
                    <Column sm={4} md={4} lg={8}>
                        <Select id="location_id" labelText="Location *" value={data.location_id}
                            onChange={e => setData('location_id', e.target.value)} required
                            invalid={!!errors.location_id} invalidText={errors.location_id}>
                            <SelectItem value="" text="-- Select Location --" />
                            {locations.map(l => <SelectItem key={l.id} value={String(l.id)} text={l.name} />)}
                        </Select>
                    </Column>
                    <Column sm={4} md={4} lg={8}>
                        <TextInput id="purchase_cost" labelText="Purchase Cost" type="number" step="0.01"
                            value={data.purchase_cost} onChange={e => setData('purchase_cost', e.target.value)}
                            invalid={!!errors.purchase_cost} invalidText={errors.purchase_cost} />
                    </Column>
                    <Column sm={4} md={4} lg={8}>
                        <TextInput id="purchase_date" labelText="Purchase Date" type="date"
                            value={data.purchase_date} onChange={e => setData('purchase_date', e.target.value)}
                            invalid={!!errors.purchase_date} invalidText={errors.purchase_date} />
                    </Column>
                    <Column sm={4} md={4} lg={8}>
                        <Select id="condition" labelText="Condition" value={data.condition}
                            onChange={e => setData('condition', e.target.value)}>
                            {CONDITIONS.map(c => <SelectItem key={c} value={c} text={c} />)}
                        </Select>
                    </Column>
                    <Column sm={4} md={4} lg={8}>
                        <Select id="status" labelText="Status" value={data.status}
                            onChange={e => setData('status', e.target.value)}>
                            {STATUSES.map(s => <SelectItem key={s} value={s} text={s} />)}
                        </Select>
                    </Column>
                    <Column sm={4} md={8} lg={16}>
                        <TextArea id="description" labelText="Description" rows={3}
                            value={data.description} onChange={e => setData('description', e.target.value)} />
                    </Column>

                    {/* Depreciation */}
                    <Column sm={4} md={8} lg={16}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0.5rem 0' }}>
                            Depreciation
                        </p>
                    </Column>
                    <Column sm={4} md={4} lg={8}>
                        <Select id="depreciation_method" labelText="Method" value={data.depreciation_method}
                            onChange={e => setData('depreciation_method', e.target.value)}
                            invalid={!!errors.depreciation_method} invalidText={errors.depreciation_method}>
                            <SelectItem value="straight_line" text="Straight Line" />
                            <SelectItem value="reducing_balance" text="Reducing Balance" />
                        </Select>
                    </Column>
                    <Column sm={4} md={4} lg={8}>
                        <TextInput id="annual_depreciation_rate" labelText="Depreciation % Per Year"
                            type="number" min="0" max="100" step="0.01"
                            value={data.annual_depreciation_rate}
                            onChange={e => setData('annual_depreciation_rate', e.target.value)}
                            helperText="Defaults to 25% per year"
                            invalid={!!errors.annual_depreciation_rate} invalidText={errors.annual_depreciation_rate} />
                    </Column>

                    {/* Photo */}
                    <Column sm={4} md={8} lg={16}>
                        <FileUploader
                            labelTitle="Asset Photo (optional)"
                            labelDescription="JPEG, PNG, WebP — max 10MB"
                            buttonLabel="Add photo"
                            accept={['image/jpeg', 'image/png', 'image/jpg', 'image/webp']}
                            onChange={e => setData('photo', e.target.files[0] || null)}
                            invalid={!!errors.photo}
                            invalidText={errors.photo}
                        />
                    </Column>
                </Grid>
            </ModalBody>
            <ModalFooter>
                <Button kind="secondary" onClick={onClose}>Cancel</Button>
                <Button kind="primary" onClick={submit} disabled={processing}>
                    {processing ? 'Saving...' : 'Save Record'}
                </Button>
            </ModalFooter>
        </ComposedModal>
    );
}
