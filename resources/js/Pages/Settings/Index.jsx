import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button, Link as CarbonLink, Tag, Tile } from '@carbon/react';
import UpdateProfileInformationForm from '@/Pages/Profile/Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm';
import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';

const roleText = {
    executive: 'Executive Access',
    admin: 'Admin Access',
    user: 'User Access',
};

const roleTone = {
    executive: 'red',
    admin: 'purple',
    user: 'gray',
};

const approvalText = {
    it_manager: 'IT Manager',
    finance_operations: 'Finance Operations',
    it_head: 'IT Head of Technology',
    finance_director: 'Finance Director',
};

const adminSettingsLinks = [
    { href: 'admin.users.index', label: 'User Management', description: 'Create accounts, assign access levels, and manage approval roles.' },
    { href: 'admin.departments.index', label: 'Departments', description: 'Maintain department records and manager ownership.' },
    { href: 'admin.categories.index', label: 'Categories', description: 'Define the asset categories used across the register.' },
    { href: 'store-management.index', label: 'Complexes & Stores', description: 'Manage complexes, shops, and the assets assigned to each site.' },
    { href: 'admin.vendors.index', label: 'Vendors', description: 'Manage supplier details and procurement categories.' },
    { href: 'admin.position-specs.index', label: 'Position Specifications', description: 'Control suggested specifications by role or position.' },
    { href: 'archive.utilities', label: 'Archive Utilities', description: 'Restore archived records and clean up lifecycle state.' },
];

export default function SettingsIndex({ auth, mustVerifyEmail, status, roleSummary }) {
    const isAdmin = auth.user.role === 'admin';
    const isExecutive = auth.user.role === 'executive';

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Settings" />

            <div className="space-y-6">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0, color: 'var(--cds-text-primary)' }}>Settings</h1>
                        <p style={{ margin: '0.5rem 0 0', color: 'var(--cds-text-secondary)', maxWidth: '46rem' }}>
                            Manage your account, security, and system access from one place while keeping the Carbon-based workspace consistent.
                        </p>
                    </div>
                    <Tag type={roleTone[auth.user.role] ?? 'gray'}>{roleText[auth.user.role] ?? 'User Access'}</Tag>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: '1rem' }}>
                    <Tile>
                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)', margin: 0 }}>Security</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0.5rem 0 0' }}>Two-Factor Authentication</p>
                        <p style={{ color: 'var(--cds-text-secondary)', marginTop: '0.5rem' }}>
                            {roleSummary.two_factor_enabled ? 'Enabled and active on this account.' : 'Not enabled yet.'}
                        </p>
                        <Button as={Link} href={route('two-factor.setup')} kind="tertiary" size="sm" style={{ marginTop: '1rem' }}>
                            Open 2FA Settings
                        </Button>
                    </Tile>

                    <Tile>
                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)', margin: 0 }}>Access Level</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0.5rem 0 0' }}>{roleText[roleSummary.role] ?? 'User Access'}</p>
                        <p style={{ color: 'var(--cds-text-secondary)', marginTop: '0.5rem' }}>
                            {roleSummary.approval_position ? `Approval role: ${approvalText[roleSummary.approval_position] ?? roleSummary.approval_position}` : 'No approval workflow position assigned.'}
                        </p>
                        {isAdmin && (
                            <Button as={Link} href={route('admin.users.index')} kind="ghost" size="sm" style={{ marginTop: '1rem' }}>
                                Manage User Access
                            </Button>
                        )}
                    </Tile>

                    <Tile>
                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)', margin: 0 }}>Navigation</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0.5rem 0 0' }}>System Shortcuts</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                            <Button as={Link} href={route('dashboard')} kind="ghost" size="sm">Open Dashboard</Button>
                            <Button as={Link} href={route('reports.index')} kind="ghost" size="sm">Open Reports</Button>
                            {auth.user.role !== 'executive' && <Button as={Link} href={route('asset-management.index')} kind="ghost" size="sm">Open Asset Register</Button>}
                            {isExecutive && <Button as={Link} href={route('procurement.dashboard')} kind="ghost" size="sm">Open Purchase Dashboard</Button>}
                        </div>
                    </Tile>
                </div>

                <Tile>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)', margin: 0 }}>Workspace Controls</p>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0.5rem 0 0', color: 'var(--cds-text-primary)' }}>System Settings & Configuration</h2>
                            <p style={{ margin: '0.5rem 0 0', color: 'var(--cds-text-secondary)', maxWidth: '48rem' }}>
                                All account, security, and administration shortcuts live here now so the sidebar stays clean while the control center remains easy to scan.
                            </p>
                        </div>
                        <Tag type="cool-gray">Centralized Settings</Tag>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                        <div style={{ border: '1px solid var(--cds-border-subtle)', background: 'var(--cds-layer-01)', padding: '1rem' }}>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)', margin: 0 }}>Account Security</p>
                            <div style={{ display: 'grid', gap: '0.875rem', marginTop: '1rem' }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--cds-text-primary)' }}>Two-Factor Authentication</p>
                                    <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>Protect sign-in with a rotating authenticator code.</p>
                                </div>
                                <Button as={Link} href={route('two-factor.setup')} kind="primary" size="sm">Open 2FA Settings</Button>
                            </div>
                        </div>

                        <div style={{ border: '1px solid var(--cds-border-subtle)', background: 'var(--cds-layer-01)', padding: '1rem' }}>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)', margin: 0 }}>Account Overview</p>
                            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--cds-text-primary)' }}>Access Profile</p>
                                    <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                                        {roleText[roleSummary.role] ?? 'User Access'} with {roleSummary.approval_position ? `approval routing via ${approvalText[roleSummary.approval_position] ?? roleSummary.approval_position}.` : 'no approval routing assigned.'}
                                    </p>
                                </div>
                                <CarbonLink as={Link} href={route('dashboard')}>Go to your landing dashboard</CarbonLink>
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <>
                            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--cds-border-subtle)' }}>
                                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)', margin: 0 }}>Administration</p>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0.5rem 0 0' }}>System management shortcuts</h3>
                                <p style={{ margin: '0.5rem 0 0', color: 'var(--cds-text-secondary)', maxWidth: '46rem' }}>
                                    Quick links to the configuration areas that used to sit in the sidebar, now grouped here as a proper control panel.
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(17rem, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                {adminSettingsLinks.map((item) => (
                                    <div key={item.href} style={{ border: '1px solid var(--cds-border-subtle)', background: 'var(--cds-layer-01)', padding: '1rem', minHeight: '11rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600, color: 'var(--cds-text-primary)' }}>{item.label}</p>
                                            <p style={{ margin: '0.5rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>{item.description}</p>
                                        </div>
                                        <Button as={Link} href={route(item.href)} kind="tertiary" size="sm">Open {item.label}</Button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </Tile>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '1rem' }}>
                    <Tile>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-2xl"
                        />
                    </Tile>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <Tile>
                            <UpdatePasswordForm className="max-w-xl" />
                        </Tile>

                        <Tile>
                            <DeleteUserForm className="max-w-xl" />
                        </Tile>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}