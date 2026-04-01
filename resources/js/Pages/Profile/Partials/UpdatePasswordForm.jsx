import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { Form, PasswordInput, Button, Tag } from '@carbon/react';

function passwordStrength(password) {
    let score = 0;

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score >= 5) {
        return { label: 'Strong', type: 'green' };
    }

    if (score >= 3) {
        return { label: 'Moderate', type: 'yellow' };
    }

    if (password.length > 0) {
        return { label: 'Weak', type: 'red' };
    }

    return { label: 'Not set', type: 'gray' };
}

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

    const strength = passwordStrength(data.password);

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

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '-0.25rem' }}>
                    <p className="text-sm text-gray-600" style={{ margin: 0 }}>
                        Use at least 12 characters with uppercase, numbers, and special characters.
                    </p>
                    <Tag type={strength.type}>{strength.label}</Tag>
                </div>

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
