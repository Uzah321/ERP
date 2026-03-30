import { Head, useForm, usePage } from '@inertiajs/react';
import { Form, TextInput, Button, InlineNotification, Tile } from '@carbon/react';

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
                <Tile className="w-full max-w-sm" style={{ padding: '2rem' }}>
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-bold text-gray-800">Two-Factor Authentication</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Open your authenticator app and enter the 6-digit code to continue.
                        </p>
                    </div>

                    {flash?.error && (
                        <InlineNotification
                            kind="error"
                            title={flash.error}
                            lowContrast
                            hideCloseButton
                            className="mb-4"
                        />
                    )}

                    <Form onSubmit={handleSubmit}>
                        <TextInput
                            id="code"
                            labelText="Verification Code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            placeholder="000000"
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            autoFocus
                            required
                            className="mb-4"
                            style={{ fontFamily: 'monospace', letterSpacing: '0.4em', textAlign: 'center', fontSize: '1.5rem' }}
                        />
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full"
                        >
                            {processing ? 'Verifying…' : 'Verify'}
                        </Button>
                    </Form>
                </Tile>
            </div>
        </>
    );
}
