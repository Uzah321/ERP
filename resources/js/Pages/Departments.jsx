import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    Form,
    TextInput,
    Button,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    InlineNotification,
    Tile,
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/icons-react';

export default function Departments() {
    const { departments, errors } = usePage().props;
    const [name, setName] = useState('');
    const [editing, setEditing] = useState(null);
    const [editName, setEditName] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        router.post(route('departments.store'), { name }, {
            onSuccess: () => setName(''),
        });
    };

    const handleEdit = (id, currentName) => {
        setEditing(id);
        setEditName(currentName);
    };

    const handleUpdate = (id) => {
        router.put(route('departments.update', id), { name: editName });
        setEditing(null);
    };

    const handleDelete = (id) => {
        router.delete(route('departments.destroy', id));
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Tile>
                <h1 className="text-2xl font-bold mb-4">Manage Departments</h1>

                <Form onSubmit={handleAdd} className="flex gap-2 mb-6">
                    <TextInput
                        id="dept-name"
                        labelText=""
                        hideLabel
                        placeholder="Department name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="flex-1"
                    />
                    <Button type="submit" renderIcon={Add} className="self-end">
                        Add
                    </Button>
                </Form>

                {errors?.name && (
                    <InlineNotification
                        kind="error"
                        title={errors.name}
                        lowContrast
                        hideCloseButton
                        className="mb-4"
                    />
                )}

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Name</TableHeader>
                            <TableHeader>Actions</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {departments.map((dep) => (
                            <TableRow key={dep.id}>
                                <TableCell>
                                    {editing === dep.id ? (
                                        <TextInput
                                            id={`edit-${dep.id}`}
                                            labelText=""
                                            hideLabel
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            size="sm"
                                        />
                                    ) : (
                                        dep.name
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {editing === dep.id ? (
                                            <>
                                                <Button
                                                    kind="primary"
                                                    size="sm"
                                                    onClick={() => handleUpdate(dep.id)}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    kind="ghost"
                                                    size="sm"
                                                    onClick={() => setEditing(null)}
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    kind="ghost"
                                                    size="sm"
                                                    renderIcon={Edit}
                                                    onClick={() => handleEdit(dep.id, dep.name)}
                                                    iconDescription="Edit"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    kind="danger--ghost"
                                                    size="sm"
                                                    renderIcon={TrashCan}
                                                    onClick={() => handleDelete(dep.id)}
                                                    iconDescription="Delete"
                                                >
                                                    Delete
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Tile>
        </div>
    );
}
