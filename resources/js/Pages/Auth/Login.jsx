import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Form,
    TextInput,
    PasswordInput,
    Button,
    Checkbox,
    InlineNotification,
} from '@carbon/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log In" />

            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--cds-text-primary)', margin: 0 }}>Welcome back</h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginTop: '0.25rem', marginBottom: 0 }}>
                    Sign in to your ASSETLINQ account
                </p>
            </div>

            {status && (
                <InlineNotification
                    kind="success"
                    title={status}
                    lowContrast
                    hideCloseButton
                    style={{ marginBottom: '1rem' }}
                />
            )}

            <Form onSubmit={submit}>
                <div style={{ marginBottom: '1rem' }}>
                    <TextInput
                        id="email"
                        type="email"
                        labelText="Email address"
                        value={data.email}
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        invalid={!!errors.email}
                        invalidText={errors.email}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <PasswordInput
                        id="password"
                        labelText="Password"
                        value={data.password}
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        invalid={!!errors.password}
                        invalidText={errors.password}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <Checkbox
                        id="remember"
                        labelText="Remember me"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            style={{ fontSize: '0.875rem', color: 'var(--cds-link-primary)', textDecoration: 'none' }}
                        >
                            Forgot password?
                        </Link>
                    )}
                    <Button type="submit" disabled={processing} style={{ marginLeft: 'auto' }}>
                        Sign In
                    </Button>
                </div>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                    Don&apos;t have an account?{' '}
                    <Link href={route('register')} style={{ color: 'var(--cds-link-primary)', fontWeight: 500, textDecoration: 'none' }}>
                        Register
                    </Link>
                </p>
            </Form>
        </GuestLayout>
    );
}
