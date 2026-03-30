import { Link } from '@inertiajs/react';
import { Theme, Tile } from '@carbon/react';
import { Checkmark } from '@carbon/icons-react';

const highlights = [
    'Full procurement chain tracking',
    'QR code asset labels',
    'Maintenance scheduling & warranty alerts',
    'Comprehensive audit trail',
];

export default function GuestLayout({ children }) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex' }}>
            {/* Left brand panel — Carbon g100 dark theme */}
            <Theme theme="g100">
                <div
                    className="brand-panel"
                    style={{
                        display: 'none',
                        width: '45%',
                        background: 'var(--cds-background)',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '3rem',
                    }}
                >
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                        <div style={{
                            width: '2.25rem', height: '2.25rem', borderRadius: '4px',
                            background: 'var(--cds-interactive)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <span style={{ color: 'var(--cds-text-primary)', fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                            ASSET<span style={{ fontWeight: 300, color: 'var(--cds-link-primary)' }}>LINQ</span>
                        </span>
                    </Link>

                    <div>
                        <h2 style={{ color: 'var(--cds-text-primary)', fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2, margin: 0 }}>
                            Enterprise Asset<br />Management,<br />
                            <span style={{ color: 'var(--cds-link-primary)', fontWeight: 300 }}>Simplified.</span>
                        </h2>
                        <p style={{ color: 'var(--cds-text-secondary)', marginTop: '1rem', fontSize: '0.875rem', lineHeight: 1.6, maxWidth: '22rem' }}>
                            Track, manage, and optimise your entire asset portfolio from procurement to disposal — all in one place.
                        </p>
                        <ul style={{ marginTop: '2rem', listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {highlights.map((item) => (
                                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                                    <Checkmark size={16} style={{ color: 'var(--cds-link-primary)', flexShrink: 0 }} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p style={{ color: 'var(--cds-text-disabled)', fontSize: '0.75rem' }}>
                        &copy; {new Date().getFullYear()} ASSETLINQ. All rights reserved.
                    </p>
                </div>
            </Theme>

            {/* Right form panel */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 1.5rem',
                background: 'var(--cds-background)',
            }}>
                {/* Mobile logo — hidden on large screens */}
                <Link
                    href="/"
                    className="brand-panel-mobile"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '2rem' }}
                >
                    <div style={{
                        width: '2rem', height: '2rem', borderRadius: '4px',
                        background: 'var(--cds-interactive)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <span style={{ color: 'var(--cds-text-primary)', fontSize: '1.125rem', fontWeight: 700 }}>
                        ASSET<span style={{ fontWeight: 300, color: 'var(--cds-link-primary)' }}>LINQ</span>
                    </span>
                </Link>

                <Tile style={{ width: '100%', maxWidth: '26rem', padding: '2.5rem 2rem' }}>
                    {children}
                </Tile>
            </div>
        </div>
    );
}
