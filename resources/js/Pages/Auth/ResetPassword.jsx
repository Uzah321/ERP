import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Form, TextInput, PasswordInput, Button } from '@carbon/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Reset Password</h1>
                <p className="text-sm text-slate-500 mt-1">Choose a new password for your account.</p>
            </div>

            <Form onSubmit={submit}>
                <TextInput
                    id="email"
                    type="email"
                    labelText="Email"
                    value={data.email}
                    autoComplete="username"
                    onChange={(e) => setData('email', e.target.value)}
                    invalid={!!errors.email}
                    invalidText={errors.email}
                    className="mb-4"
                />

                <PasswordInput
                    id="password"
                    labelText="Password"
                    value={data.password}
                    autoComplete="new-password"
                    autoFocus
                    onChange={(e) => setData('password', e.target.value)}
                    invalid={!!errors.password}
                    invalidText={errors.password}
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
                    className="mb-4"
                />

                <div className="flex justify-end mt-4">
                    <Button type="submit" disabled={processing}>
                        Reset Password
                    </Button>
                </div>
            </Form>
        </GuestLayout>
    );
}
