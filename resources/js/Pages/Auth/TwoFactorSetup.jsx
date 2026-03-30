import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import QRCode from 'react-qr-code';
import { useState } from 'react';
import {
    Form,
    TextInput,
    PasswordInput,
    Button,
    InlineNotification,
    Tag,
    Tile,
} from '@carbon/react';
import { CheckmarkFilled } from '@carbon/icons-react';

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
                    <InlineNotification
                        kind="success"
                        title={flash.success}
                        lowContrast
                        hideCloseButton
                    />
                )}

                <h1 className="text-xl font-bold" style={{ color: 'var(--cds-text-primary)' }}>Two-Factor Authentication (2FA)</h1>

                {enabled ? (
                    <Tile>
                        <div className="flex items-center gap-3 mb-4">
                            <CheckmarkFilled size={24} style={{ color: 'var(--cds-support-success)' }} />
                            <div>
                                <p className="font-semibold" style={{ color: 'var(--cds-support-success)' }}>2FA is enabled</p>
                                {confirmedAt && <p className="text-xs" style={{ color: 'var(--cds-support-success)' }}>Activated: {confirmedAt}</p>}
                            </div>
                            <Tag type="green" className="ml-auto">Active</Tag>
                        </div>
                        <p className="text-sm mb-6" style={{ color: 'var(--cds-text-secondary)' }}>
                            Your account is protected with an authenticator app. You will be asked for a
                            verification code each time you log in.
                        </p>

                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--cds-text-secondary)' }}>Disable 2FA</h3>
                            <Form onSubmit={submitDisable}>
                                <PasswordInput
                                    id="disable-password"
                                    labelText="Current Password *"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password to confirm"
                                    required
                                    className="mb-4"
                                />
                                <Button type="submit" kind="danger">
                                    Disable 2FA
                                </Button>
                            </Form>
                        </div>
                    </Tile>
                ) : (
                    <Tile>
                        <p className="text-sm mb-6" style={{ color: 'var(--cds-text-secondary)' }}>
                            Scan the QR code below with an authenticator app (Google Authenticator, Authy,
                            Microsoft Authenticator, etc.), then enter the 6-digit code to confirm setup.
                        </p>

                        <div className="flex flex-col items-center gap-4 mb-6">
                            <div className="p-4 bg-white border-2 border-gray-200 inline-block">
                                <QRCode value={qrUrl} size={180} />
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setShowSecret(!showSecret)}
                                    className="text-xs hover:underline"
                                    style={{ color: 'var(--cds-link-primary)' }}
                                >
                                    {showSecret ? 'Hide' : "Can't scan? Show"} the secret key
                                </button>
                                {showSecret && (
                                    <p className="mt-2 text-sm px-4 py-2 tracking-widest select-all" style={{ background: 'var(--cds-layer-01)', color: 'var(--cds-text-secondary)' }}>
                                        {secret}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--cds-text-secondary)' }}>Confirm Setup</h3>
                            <Form onSubmit={submitEnable}>
                                <TextInput
                                    id="enable-code"
                                    labelText="6-digit Code from App *"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    inputMode="numeric"
                                    pattern="[0-9]{6}"
                                    maxLength={6}
                                    placeholder="000000"
                                    required
                                    className="mb-4"
                                    style={{ letterSpacing: '0.3em' }}
                                />
                                <Button type="submit">
                                    Enable 2FA
                                </Button>
                            </Form>
                        </div>
                    </Tile>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
