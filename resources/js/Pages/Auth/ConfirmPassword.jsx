import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Form, PasswordInput, Button } from '@carbon/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Confirm Password</h1>
                <p className="text-sm text-slate-500 mt-1">
                    This is a secure area of the application. Please confirm your
                    password before continuing.
                </p>
            </div>

            <Form onSubmit={submit}>
                <PasswordInput
                    id="password"
                    labelText="Password"
                    value={data.password}
                    autoFocus
                    onChange={(e) => setData('password', e.target.value)}
                    invalid={!!errors.password}
                    invalidText={errors.password}
                    className="mb-4"
                />

                <div className="flex justify-end mt-4">
                    <Button type="submit" disabled={processing}>
                        Confirm
                    </Button>
                </div>
            </Form>
        </GuestLayout>
    );
}
