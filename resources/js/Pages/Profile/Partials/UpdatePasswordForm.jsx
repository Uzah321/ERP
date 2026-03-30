import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { Form, PasswordInput, Button } from '@carbon/react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errs) => {
                if (errs.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errs.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Update Password
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </header>

            <Form onSubmit={updatePassword} className="mt-6 space-y-4">
                <PasswordInput
                    id="current_password"
                    labelText="Current Password"
                    value={data.current_password}
                    onChange={(e) => setData('current_password', e.target.value)}
                    autoComplete="current-password"
                    invalid={!!errors.current_password}
                    invalidText={errors.current_password}
                    ref={currentPasswordInput}
                />

                <PasswordInput
                    id="password"
                    labelText="New Password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    autoComplete="new-password"
                    invalid={!!errors.password}
                    invalidText={errors.password}
                    ref={passwordInput}
                />

                <PasswordInput
                    id="password_confirmation"
                    labelText="Confirm Password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    autoComplete="new-password"
                    invalid={!!errors.password_confirmation}
                    invalidText={errors.password_confirmation}
                />

                <div className="flex items-center gap-4 mt-4">
                    <Button type="submit" disabled={processing}>Save</Button>

                    {recentlySuccessful && (
                        <p className="text-sm text-gray-600">Saved.</p>
                    )}
                </div>
            </Form>
        </section>
    );
}
