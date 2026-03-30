import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import {
    Button,
    Modal,
    PasswordInput,
    InlineNotification,
} from '@carbon/react';

export default function DeleteUserForm({ className = '' }) {
    const [open, setOpen] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const deleteUser = (e) => {
        e?.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
            },
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setOpen(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Delete Account
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to retain.
                </p>
            </header>

            <Button kind="danger" onClick={() => setOpen(true)}>
                Delete Account
            </Button>

            <Modal
                open={open}
                onRequestClose={closeModal}
                onRequestSubmit={deleteUser}
                danger
                modalHeading="Are you sure you want to delete your account?"
                primaryButtonText={processing ? 'Deleting…' : 'Delete Account'}
                secondaryButtonText="Cancel"
                primaryButtonDisabled={processing || !data.password}
            >
                <p className="mb-4 text-sm text-gray-600">
                    Once your account is deleted, all of its resources and data will be
                    permanently deleted. Please enter your password to confirm you would
                    like to permanently delete your account.
                </p>

                {errors.password && (
                    <InlineNotification
                        kind="error"
                        title={errors.password}
                        lowContrast
                        hideCloseButton
                        className="mb-4"
                    />
                )}

                <PasswordInput
                    id="delete-password"
                    labelText="Password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Enter your password"
                    ref={passwordInput}
                    autoFocus
                />
            </Modal>
        </section>
    );
}
