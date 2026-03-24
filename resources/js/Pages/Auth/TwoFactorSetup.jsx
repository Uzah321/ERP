import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import QRCode from 'react-qr-code';
import { useState } from 'react';

export default function TwoFactorSetup({ auth, qrUrl, secret, enabled, confirmedAt, flash }) {
    const [code, setCode]         = useState('');
    const [password, setPassword] = useState('');
    const [showSecret, setShowSecret] = useState(false);

    function submitEnable(e) {
        e.preventDefault();
        router.post(route('two-factor.enable'), { code }, {
            onSuccess: () => setCode(''),
            onError:   () => setCode(''),
        });
    }

    function submitDisable(e) {
        e.preventDefault();
        router.post(route('two-factor.disable'), { password }, {
            onSuccess: () => setPassword(''),
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Two-Factor Authentication" />
            <div className="p-6 max-w-2xl mx-auto space-y-6">

                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">{flash.success}</div>
                )}

                <h1 className="text-xl font-bold text-gray-800">Two-Factor Authentication (2FA)</h1>

                {enabled ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                            </div>
                            <div>
                                <p className="font-semibold text-green-800">2FA is enabled</p>
                                {confirmedAt && <p className="text-xs text-green-600">Activated: {confirmedAt}</p>}
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">Your account is protected with an authenticator app. You will be asked for a verification code each time you log in.</p>

                        <form onSubmit={submitDisable} className="space-y-3 border-t border-green-200 pt-4">
                            <h3 className="text-sm font-semibold text-gray-700">Disable 2FA</h3>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Current Password *</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                                    required placeholder="Enter your password to confirm" />
                            </div>
                            <button type="submit"
                                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">
                                Disable 2FA
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
                        <p className="text-sm text-gray-600">
                            Scan the QR code below with an authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.), then enter the 6-digit code to confirm setup.
                        </p>

                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-white border-2 border-gray-200 rounded-xl inline-block">
                                <QRCode value={qrUrl} size={180} />
                            </div>

                            <div className="text-center">
                                <button onClick={() => setShowSecret(!showSecret)}
                                    className="text-xs text-blue-600 hover:underline">
                                    {showSecret ? 'Hide' : 'Can\'t scan? Show'} the secret key
                                </button>
                                {showSecret && (
                                    <p className="mt-2 font-mono text-sm bg-gray-100 px-4 py-2 rounded-lg tracking-widest text-gray-700 select-all">
                                        {secret}
                                    </p>
                                )}
                            </div>
                        </div>

                        <form onSubmit={submitEnable} className="space-y-3 border-t border-gray-200 pt-4">
                            <h3 className="text-sm font-semibold text-gray-700">Confirm Setup</h3>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">6-digit Code from App *</label>
                                <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                                    value={code} onChange={e => setCode(e.target.value)}
                                    className="w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-center font-mono tracking-widest text-lg"
                                    placeholder="000000" required />
                            </div>
                            <button type="submit"
                                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
                                Enable 2FA
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
