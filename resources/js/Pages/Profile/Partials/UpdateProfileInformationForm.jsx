import { Link, useForm, usePage } from '@inertiajs/react';
import { Form, TextInput, Button, InlineNotification } from '@carbon/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Profile Information
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Update your account&apos;s profile information and email address.
                </p>
            </header>

            <Form onSubmit={submit} className="mt-6 space-y-4">
                <TextInput
                    id="name"
                    labelText="Name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    autoFocus
                    autoComplete="name"
                    invalid={!!errors.name}
                    invalidText={errors.name}
                />

                <TextInput
                    id="email"
                    type="email"
                    labelText="Email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                    autoComplete="username"
                    invalid={!!errors.email}
                    invalidText={errors.email}
                />

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="text-sm text-blue-600 underline hover:text-blue-800"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <InlineNotification
                                kind="success"
                                title="A new verification link has been sent to your email address."
                                lowContrast
                                hideCloseButton
                                className="mt-2"
                            />
                        )}
                    </div>
                )}

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
