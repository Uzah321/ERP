import { Head } from '@inertiajs/react';
import { useForm, usePage } from '@inertiajs/react';

export default function TwoFactorChallenge() {
    const { flash } = usePage().props;
    const { data, setData, post, processing } = useForm({ code: '' });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('two-factor.verify'));
    }

    return (
        <>
            <Head title="Two-Factor Challenge" />
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8 space-y-6">

                    <div className="text-center space-y-2">
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-gray-800">Two-Factor Authentication</h1>
                        <p className="text-sm text-gray-500">Open your authenticator app and enter the 6-digit code to continue.</p>
                    </div>

                    {flash?.error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                            {flash.error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2 text-center">Verification Code</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                value={data.code}
                                onChange={e => setData('code', e.target.value)}
                                autoFocus
                                required
                                placeholder="000000"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-colors"
                        >
                            {processing ? 'Verifying…' : 'Verify'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
