import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

function SuccessPanel() {
    return (
        <div className="text-center py-4">
            {/* Checkmark circle */}
            <div className="mx-auto mb-5 flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">Account Created!</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Your ASSETLINQ account has been set up successfully.<br />
                We&apos;ve sent a welcome email to your inbox with a login link.
            </p>

            {/* Email hint box */}
            <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-left mb-8">
                <svg className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <p className="text-sm text-indigo-700 leading-relaxed">
                    Check your inbox for an email from <strong>ASSETLINQ</strong> with a{' '}
                    <strong>Log In to ASSETLINQ</strong> button inside.
                </p>
            </div>

            <Link
                href={route('login')}
                className="inline-block w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition text-center"
            >
                Go to Login
            </Link>

            <p className="mt-4 text-xs text-slate-400">
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
                        <h1 className="text-2xl font-bold text-slate-800">Create an account</h1>
                        <p className="text-sm text-slate-500 mt-1">Join ASSETLINQ to manage your assets</p>
                    </div>

                    <form onSubmit={submit}>
                        <div>
                            <InputLabel htmlFor="name" value="Name" />

                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="mt-1 block w-full"
                                autoComplete="name"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />

                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="email" value="Email" />

                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />

                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="department_id" value="Department" />

                            <select
                                id="department_id"
                                name="department_id"
                                value={data.department_id}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                onChange={(e) => setData('department_id', e.target.value)}
                                required
                            >
                                <option value="">Select a Department</option>
                                {departments && departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>

                            {(!departments || departments.length === 0) && (
                                <p className="mt-1 text-sm text-red-500">
                                    No departments available. Please contact an administrator.
                                </p>
                            )}

                            <InputError message={errors.department_id} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="password" value="Password" />

                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />

                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Confirm Password"
                            />

                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                                required
                            />

                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <Link
                                href={route('login')}
                                className="text-sm text-slate-500 hover:text-slate-700"
                            >
                                Already registered?{' '}
                                <span className="text-indigo-600 font-medium">Sign in</span>
                            </Link>

                            <PrimaryButton disabled={processing}>
                                Register
                            </PrimaryButton>
                        </div>
                    </form>
                </>
            )}
        </GuestLayout>
    );
}
