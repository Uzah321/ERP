import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Form,
    TextInput,
    PasswordInput,
    Select,
    SelectItem,
    Button,
    InlineNotification,
} from '@carbon/react';
import { CheckmarkFilled, Email } from '@carbon/icons-react';

function SuccessPanel() {
    return (
        <div className="text-center py-4">
            <div className="mx-auto mb-5 flex items-center justify-center w-16 h-16 rounded-full" style={{ background: 'var(--cds-layer-01)' }}>
                <CheckmarkFilled size={32} style={{ color: 'var(--cds-support-success)' }} />
            </div>

            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--cds-text-primary)' }}>Account Created!</h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--cds-text-secondary)' }}>
                Your ASSETLINQ account has been set up successfully.<br />
                We&apos;ve sent a welcome email to your inbox with a login link.
            </p>

            <div className="flex items-start gap-3 px-4 py-3 text-left mb-8" style={{ background: 'var(--cds-layer-01)', border: '1px solid var(--cds-border-subtle)' }}>
                <Email size={20} className="shrink-0 mt-0.5" style={{ color: 'var(--cds-link-primary)' }} />
                <p className="text-sm leading-relaxed" style={{ color: 'var(--cds-link-primary)' }}>
                    Check your inbox for an email from <strong>ASSETLINQ</strong> with a{' '}
                    <strong>Log In to ASSETLINQ</strong> button inside.
                </p>
            </div>

            <Link
                href={route('login')}
                className="inline-block w-full px-6 py-3 font-semibold text-sm transition text-center"
                style={{ background: 'var(--cds-interactive)', color: 'var(--cds-text-inverse)' }}
            >
                Go to Login
            </Link>

            <p className="mt-4 text-xs" style={{ color: 'var(--cds-text-secondary)' }}>
                Didn&apos;t receive the email? Check your spam folder or contact your administrator.
            </p>
        </div>
    );
}

export default function Register({ departments }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        department_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            {flash?.success === 'registered' ? (
                <SuccessPanel />
            ) : (
                <>
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--cds-text-primary)' }}>Create an account</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--cds-text-secondary)' }}>Join ASSETLINQ to manage your assets</p>
                    </div>

                    <Form onSubmit={submit}>
                        <TextInput
                            id="name"
                            labelText="Name"
                            value={data.name}
                            autoComplete="name"
                            autoFocus
                            onChange={(e) => setData('name', e.target.value)}
                            invalid={!!errors.name}
                            invalidText={errors.name}
                            required
                            className="mb-4"
                        />

                        <TextInput
                            id="email"
                            type="email"
                            labelText="Email"
                            value={data.email}
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            invalid={!!errors.email}
                            invalidText={errors.email}
                            required
                            className="mb-4"
                        />

                        <Select
                            id="department_id"
                            labelText="Department"
                            value={data.department_id}
                            onChange={(e) => setData('department_id', e.target.value)}
                            invalid={!!errors.department_id}
                            invalidText={errors.department_id}
                            required
                            className="mb-4"
                        >
                            <SelectItem value="" text="Select a Department" />
                            {departments && departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id} text={dept.name} />
                            ))}
                        </Select>

                        {(!departments || departments.length === 0) && (
                            <p className="text-sm mb-4" style={{ color: 'var(--cds-support-error)' }}>
                                No departments available. Please contact an administrator.
                            </p>
                        )}

                        <PasswordInput
                            id="password"
                            labelText="Password"
                            value={data.password}
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            invalid={!!errors.password}
                            invalidText={errors.password}
                            required
                            className="mb-4"
                        />

                        <PasswordInput
                            id="password_confirmation"
                            labelText="Confirm Password"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            invalid={!!errors.password_confirmation}
                            invalidText={errors.password_confirmation}
                            required
                            className="mb-6"
                        />

                        <div className="flex items-center justify-between">
                            <Link
                                href={route('login')}
                                className="text-sm"
                                style={{ color: 'var(--cds-text-secondary)' }}
                            >
                                Already registered?{' '}
                                <span className="font-medium" style={{ color: 'var(--cds-link-primary)' }}>Sign in</span>
                            </Link>

                            <Button type="submit" disabled={processing}>
                                Register
                            </Button>
                        </div>
                    </Form>
                </>
            )}
        </GuestLayout>
    );
}
