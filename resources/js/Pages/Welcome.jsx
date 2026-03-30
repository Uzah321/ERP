import { Head, Link } from '@inertiajs/react';
import { Theme, Button } from '@carbon/react';
import { ArrowRight, Checkmark } from '@carbon/icons-react';

const features = [
    { label: 'Asset Register', desc: 'Full lifecycle tracking from acquisition to disposal' },
    { label: 'Procurement Chain', desc: 'CAPEX, Purchase Orders, Goods Receipts & Invoices' },
    { label: 'Maintenance Tracking', desc: 'Preventive schedules and warranty reminders' },
    { label: 'Reports & Exports', desc: 'CSV, Sage and executive summary exports' },
    { label: 'Two-Factor Auth', desc: 'TOTP-based 2FA for every user account' },
    { label: 'Audit Trail', desc: 'Per-asset history timeline with change diffs' },
    { label: 'Software Licences', desc: 'Seat tracking with expiry alerts' },
    { label: 'Department Rollup', desc: 'Asset counts and values by department' },
];

export default function Welcome({ auth, canLogin, canRegister }) {
    const user = auth?.user;

    return (
        <Theme theme="g100">
            <Head title="ASSETLINQ — Enterprise Asset Management" />
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cds-background)' }}>
                <header
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 2rem',
                        height: '3rem',
                        borderBottom: '1px solid var(--cds-border-subtle)',
                        background: 'var(--cds-layer-01)',
                    }}
                >
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                        <div
                            style={{
                                width: '1.5rem',
                                height: '1.5rem',
                                background: 'var(--cds-interactive)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <span style={{ color: 'var(--cds-text-primary)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                            ASSET<span style={{ fontWeight: 300, color: 'var(--cds-link-primary)' }}>LINQ</span>
                        </span>
                    </Link>

                    <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {user ? (
                            <Button kind="primary" size="sm" renderIcon={ArrowRight} href={route('dashboard')} as={Link}>
                                Go to Dashboard
                            </Button>
                        ) : (
                            <>
                                {canLogin && (
                                    <Button kind="ghost" size="sm" href={route('login')} as={Link}>
                                        Log In
                                    </Button>
                                )}
                                {canRegister && (
                                    <Button kind="primary" size="sm" href={route('register')} as={Link}>
                                        Register
                                    </Button>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem 4rem', textAlign: 'center' }}>
                    <p
                        style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--cds-link-primary)',
                            marginBottom: '1.5rem',
                        }}
                    >
                        Enterprise Asset Management System
                    </p>

                    <h1
                        style={{
                            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                            fontWeight: 300,
                            lineHeight: 1.1,
                            color: 'var(--cds-text-primary)',
                            maxWidth: '44rem',
                            margin: '0 0 1.5rem',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Manage Every Asset.<br />
                        <strong style={{ fontWeight: 700, color: 'var(--cds-text-primary)' }}>End to End.</strong>
                    </h1>

                    <p
                        style={{
                            fontSize: '1rem',
                            color: 'var(--cds-text-secondary)',
                            maxWidth: '36rem',
                            lineHeight: 1.6,
                            margin: '0 0 2.5rem',
                        }}
                    >
                        ASSETLINQ streamlines the full asset lifecycle — from procurement and allocation
                        to maintenance, auditing, and disposal — in one unified platform.
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                        {(user || canLogin) && (
                            <Button kind="primary" size="lg" renderIcon={ArrowRight} href={user ? route('dashboard') : route('login')} as={Link}>
                                {user ? 'Go to Dashboard' : 'Sign In'}
                            </Button>
                        )}
                        {!user && canRegister && (
                            <Button kind="tertiary" size="lg" href={route('register')} as={Link}>
                                Create Account
                            </Button>
                        )}
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
                            gap: '1px',
                            marginTop: '5rem',
                            width: '100%',
                            maxWidth: '64rem',
                            border: '1px solid var(--cds-border-subtle)',
                            background: 'var(--cds-border-subtle)',
                        }}
                    >
                        {features.map((feature) => (
                            <div
                                key={feature.label}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    padding: '1.5rem',
                                    background: 'var(--cds-layer-01)',
                                    textAlign: 'left',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Checkmark size={16} style={{ color: 'var(--cds-link-primary)', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                                        {feature.label}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', lineHeight: 1.5, margin: 0, paddingLeft: '1.5rem' }}>
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </main>

                <footer
                    style={{
                        padding: '1rem 2rem',
                        borderTop: '1px solid var(--cds-border-subtle)',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        color: 'var(--cds-text-disabled)',
                    }}
                >
                    &copy; {new Date().getFullYear()} ASSETLINQ. All rights reserved.
                </footer>
            </div>
        </Theme>
    );
}
