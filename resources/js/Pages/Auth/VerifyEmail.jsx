import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Form, Button, InlineNotification } from '@carbon/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Verify Email</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Thanks for signing up! Before getting started, could you verify
                    your email address by clicking on the link we just emailed to
                    you? If you didn&apos;t receive the email, we will gladly send you
                    another.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <InlineNotification
                    kind="success"
                    title="A new verification link has been sent to the email address you provided during registration."
                    lowContrast
                    hideCloseButton
                    className="mb-4"
                />
            )}

            <Form onSubmit={submit}>
                <div className="flex items-center justify-between mt-4">
                    <Button type="submit" disabled={processing}>
                        Resend Verification Email
                    </Button>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-sm text-slate-500 hover:text-slate-700 underline"
                    >
                        Log Out
                    </Link>
                </div>
            </Form>
        </GuestLayout>
    );
}
