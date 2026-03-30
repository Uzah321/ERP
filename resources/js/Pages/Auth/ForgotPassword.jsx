import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Form, TextInput, Button, InlineNotification } from '@carbon/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Forgot Password</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Forgot your password? No problem. Just let us know your email
                    address and we will email you a password reset link that will
                    allow you to choose a new one.
                </p>
            </div>

            {status && (
                <InlineNotification
                    kind="success"
                    title={status}
                    lowContrast
                    hideCloseButton
                    className="mb-4"
                />
            )}

            <Form onSubmit={submit}>
                <TextInput
                    id="email"
                    type="email"
                    labelText="Email"
                    value={data.email}
                    autoFocus
                    onChange={(e) => setData('email', e.target.value)}
                    invalid={!!errors.email}
                    invalidText={errors.email}
                    className="mb-4"
                />

                <div className="flex justify-end mt-4">
                    <Button type="submit" disabled={processing}>
                        Email Password Reset Link
                    </Button>
                </div>
            </Form>
        </GuestLayout>
    );
}
