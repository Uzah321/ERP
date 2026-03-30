import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import {
    Form,
    TextInput,
    Button,
    Tag,
    InlineNotification,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    Tile,
} from '@carbon/react';

export default function Audit({ auth, recent_audits }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        barcode: '',
    });
    const [successMsg, setSuccessMsg] = useState('');
    const inputRef = useRef();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('audit.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMsg('Successfully audited: ' + data.barcode);
                reset('barcode');
                clearErrors();
                setTimeout(() => setSuccessMsg(''), 3000);
                inputRef.current?.focus();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Physical Asset Audit</h2>}
        >
            <Head title="Asset Audit" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">

                    <div className="w-full md:w-1/3">
                        <Tile>
                            <h3 className="text-lg font-bold mb-2">Scan Barcode / Serial Number</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Use a barcode scanner or manually type the asset barcode or serial number
                                to verify physical presence.
                            </p>

                            {successMsg && (
                                <InlineNotification
                                    kind="success"
                                    title={successMsg}
                                    lowContrast
                                    hideCloseButton
                                    className="mb-4"
                                />
                            )}

                            <Form onSubmit={submit}>
                                <TextInput
                                    id="barcode"
                                    labelText="Asset Barcode or Serial Number"
                                    value={data.barcode}
                                    onChange={(e) => setData('barcode', e.target.value)}
                                    ref={inputRef}
                                    autoComplete="off"
                                    placeholder="Scan or type barcode / serial number"
                                    invalid={!!errors.barcode}
                                    invalidText={errors.barcode}
                                    className="mb-4"
                                />
                                <Button type="submit" disabled={processing} className="w-full">
                                    Verify Asset
                                </Button>
                            </Form>
                        </Tile>
                    </div>

                    <div className="w-full md:w-2/3">
                        <Tile>
                            <h3 className="text-lg font-bold mb-4 border-b pb-2">Audited Today</h3>
                            {recent_audits.length > 0 ? (
                                <Table size="sm">
                                    <TableHead>
                                        <TableRow>
                                            <TableHeader>Serial Number</TableHeader>
                                            <TableHeader>Barcode</TableHeader>
                                            <TableHeader>Name</TableHeader>
                                            <TableHeader>Location</TableHeader>
                                            <TableHeader>Status</TableHeader>
                                            <TableHeader>Time</TableHeader>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recent_audits.map((asset) => (
                                            <TableRow key={asset.id}>
                                                <TableCell>
                                                    <span className="font-mono font-bold text-blue-700">
                                                        {asset.serial_number || '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono">{asset.barcode}</span>
                                                </TableCell>
                                                <TableCell>{asset.name}</TableCell>
                                                <TableCell>{asset.location?.name}</TableCell>
                                                <TableCell>
                                                    <Tag type="green">Verified</Tag>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(asset.last_audited_at).toLocaleTimeString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-gray-500 text-center py-8">
                                    No assets have been audited today.
                                </p>
                            )}
                        </Tile>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
