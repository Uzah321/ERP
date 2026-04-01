import { useEffect, useState, Component } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }
    static getDerivedStateFromError(error) {
        return { error };
    }
    render() {
        if (this.state.error) {
            return (
                <div style={{ padding: '2rem', border: '2px solid #da1e28', borderRadius: '4px', margin: '1rem', background: '#fff1f1' }}>
                    <p style={{ fontWeight: 700, color: '#da1e28', marginBottom: '0.5rem' }}>Settings page error (report this to support):</p>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.8rem', color: '#161616' }}>{String(this.state.error)}{'\n'}{this.state.error?.stack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}
import { Head, Link } from '@inertiajs/react';
import {
    Button,
    Checkbox,
    FileUploader,
    InlineNotification,
    Select,
    SelectItem,
    Tag,
    TextInput,
    Tile,
} from '@carbon/react';
import UpdateProfileInformationForm from '@/Pages/Profile/Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm';
import { safeRoute } from '@/utils/ziggy';

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

const privilegedTabs = [
    { id: 'profile', label: 'Profile Settings' },
    { id: 'security', label: 'Security Settings' },
    { id: 'assets', label: 'Asset Management' },
    { id: 'system', label: 'System Configuration' },
    { id: 'backup', label: 'Backup & Data' },
];

const basicTabs = privilegedTabs.slice(0, 2);

function hashTabId(tabs) {
    if (typeof window === 'undefined') {
        return tabs[0].id;
    }

    const hash = window.location.hash.replace('#', '');
    return tabs.some((tab) => tab.id === hash) ? hash : tabs[0].id;
}

function RangeField({ id, label, min, max, step = 1, value, suffix = '', onChange, helperText }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                <label htmlFor={id} style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>{label}</label>
                <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>{value}{suffix}</span>
            </div>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                style={{ width: '100%', marginTop: '0.75rem' }}
            />
            {helperText && <p style={{ margin: '0.5rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.75rem' }}>{helperText}</p>}
        </div>
    );
}

function TabButton({ active, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                textAlign: 'left',
                border: '1px solid ' + (active ? 'var(--cds-interactive)' : 'var(--cds-border-subtle)'),
                background: active ? 'var(--cds-layer-selected-01)' : 'var(--cds-layer-01)',
                color: 'var(--cds-text-primary)',
                padding: '0.9rem 1rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 500,
            }}
        >
            {label}
        </button>
    );
}

function PanelHeader({ eyebrow, title, description, action }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
                <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>{eyebrow}</p>
                <h2 style={{ margin: '0.5rem 0 0', fontSize: '1.35rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>{title}</h2>
                <p style={{ margin: '0.5rem 0 0', maxWidth: '48rem', color: 'var(--cds-text-secondary)', lineHeight: 1.6 }}>{description}</p>
            </div>
            {action}
        </div>
    );
}

function AccessBadge({ role, approvalPosition }) {
    return (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            <Tag type={roleTone[role] ?? 'gray'}>{roleText[role] ?? 'User Access'}</Tag>
            <Tag type="cool-gray">{approvalPosition ? (approvalText[approvalPosition] ?? approvalPosition) : 'No approval workflow role'}</Tag>
            <Tag type="blue">Assigned by executives</Tag>
        </div>
    );
}

export default function SettingsIndex({ auth, mustVerifyEmail, status, roleSummary, settingsDefaults: settingsDefaultsProp }) {
    const settingsDefaults = settingsDefaultsProp ?? {
        profile: { first_name: '', last_name: '', email: '', phone: '', department: 'Unassigned', job_title: '', profile_picture_label: '' },
        security: { session_timeout: 30, password_min_length: 12, require_uppercase: true, require_numbers: true, require_special_characters: true },
        assets: { categories: [], allow_custom_categories: true, auto_flag_asset_age_years: 5, maintenance_interval_days: 180, maintenance_reminder_lead_days: 14, maintenance_auto_send: true, qr_code_format: 'PNG', auto_generate_asset_ids: true },
        system: { organization_name: '', timezone: 'UTC', date_format: 'Y-m-d', currency: 'USD', language: 'en', smtp_host: '', smtp_port: '', smtp_username: '', smtp_password: '', sender_name: '', sender_email: '', smtp_tls_enabled: false, require_executive_approval_for_new_users: true, auto_deactivate_inactive_users: true, inactive_days: 90 },
        backup: { auto_backup_enabled: false, backup_frequency: 'weekly', backup_time: '02:00', retention_days: 30, backup_destination: 'local', activity_log_retention: '365 days', deleted_asset_retention: '90 days', auto_purge_expired_data: false },
    };

    const isAdmin = auth.user.role === 'admin' || auth.user.is_super_user === true;
    const isExecutive = auth.user.role === 'executive' || auth.user.is_super_user === true;
    const isPrivileged = isAdmin || isExecutive;
    const tabs = isPrivileged ? privilegedTabs : basicTabs;
    const twoFactorSetupHref = safeRoute('two-factor.setup');
    const usersIndexHref = safeRoute('users.index');

    const [activeTab, setActiveTab] = useState(hashTabId(tabs));
    const [securitySettings, setSecuritySettings] = useState(settingsDefaults.security);
    const [assetSettings, setAssetSettings] = useState(settingsDefaults.assets);
    const [systemSettings, setSystemSettings] = useState(settingsDefaults.system);
    const [backupSettings, setBackupSettings] = useState(settingsDefaults.backup);

    useEffect(() => {
        const syncHash = () => setActiveTab(hashTabId(tabs));

        syncHash();
        window.addEventListener('hashchange', syncHash);

        return () => window.removeEventListener('hashchange', syncHash);
    }, [tabs]);

    const selectTab = (tabId) => {
        setActiveTab(tabId);
        window.history.replaceState(null, '', `#${tabId}`);
    };

    const firstProfile = settingsDefaults.profile.first_name || 'Not set';
    const lastProfile = settingsDefaults.profile.last_name || 'Not set';

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Settings" />
            <ErrorBoundary>

            <div className="space-y-6">
                <Tile style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #f4f4f4 0%, #eef6ff 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ maxWidth: '52rem' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>Settings hub</p>
                            <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0 0', color: 'var(--cds-text-primary)' }}>Account, Security, and System Settings</h1>
                            <p style={{ margin: '0.75rem 0 0', color: 'var(--cds-text-secondary)', lineHeight: 1.6 }}>
                                This workspace is now organized into focused tabs instead of repeated shortcut cards. Personal account changes save through the existing profile flows, while organization-wide controls show the current operating defaults for admin and executive review.
                            </p>
                            <AccessBadge role={roleSummary.role} approvalPosition={roleSummary.approval_position} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <Tag type={roleSummary.two_factor_enabled ? 'green' : 'gray'}>{roleSummary.two_factor_enabled ? '2FA enabled' : '2FA not enabled'}</Tag>
                            {isPrivileged && <Tag type="blue">Admin / executive controls visible</Tag>}
                        </div>
                    </div>
                </Tile>

                {!isPrivileged && (
                    <InlineNotification
                        kind="info"
                        title="Limited settings scope"
                        subtitle="General users can update personal profile and security settings here. Asset, system, and backup configuration is limited to admin and executive roles."
                        lowContrast
                        hideCloseButton
                    />
                )}

                {isPrivileged && (
                    <InlineNotification
                        kind="warning"
                        title="Organization settings are showing current defaults"
                        subtitle="System-wide controls below reflect the current operating defaults and configuration values. They are ready for future persistence wiring, but this pass removes duplicated buttons and centralizes the settings structure without inventing a fake save path."
                        lowContrast
                        hideCloseButton
                    />
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '16rem minmax(0, 1fr)', gap: '1rem', alignItems: 'start' }}>
                    <Tile style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ display: 'grid' }}>
                            {tabs.map((tab) => (
                                <TabButton
                                    key={tab.id}
                                    active={activeTab === tab.id}
                                    label={tab.label}
                                    onClick={() => selectTab(tab.id)}
                                />
                            ))}
                        </div>
                    </Tile>

                    <div className="space-y-6">
                        {activeTab === 'profile' && (
                            <section id="profile" className="space-y-6">
                                <PanelHeader
                                    eyebrow="Profile Settings"
                                    title="Personal Information"
                                    description="Manage your core account identity here. Access level is visible but cannot be changed in this workspace because roles are assigned by executives."
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1rem' }}>
                                    <Tile>
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Profile Snapshot</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                            <TextInput id="settings-first-name" labelText="First Name" value={firstProfile} readOnly />
                                            <TextInput id="settings-last-name" labelText="Last Name" value={lastProfile} readOnly />
                                            <TextInput id="settings-email" labelText="Email" value={settingsDefaults.profile.email || ''} readOnly />
                                            <TextInput id="settings-phone" labelText="Phone" value={settingsDefaults.profile.phone || 'Not configured'} readOnly />
                                            <TextInput id="settings-department" labelText="Department" value={settingsDefaults.profile.department || 'Unassigned'} readOnly />
                                            <TextInput id="settings-job-title" labelText="Job Title" value={settingsDefaults.profile.job_title || 'Not configured'} readOnly />
                                        </div>
                                        <div style={{ marginTop: '1rem' }}>
                                            <TextInput id="settings-access-control" labelText="User Access Control" value={roleText[roleSummary.role] ?? 'User Access'} readOnly helperText="Assigned by executives and not editable from profile settings." />
                                        </div>
                                    </Tile>

                                    <Tile>
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Profile Picture</p>
                                        <p style={{ margin: '0.5rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                                            {settingsDefaults.profile.profile_picture_label}
                                        </p>
                                        <div style={{ marginTop: '1rem' }}>
                                            <FileUploader
                                                labelTitle="Profile picture upload"
                                                labelDescription="PNG, JPG, or WebP"
                                                buttonLabel="Choose image"
                                                accept={['image/jpeg', 'image/png', 'image/jpg', 'image/webp']}
                                                disabled
                                            />
                                        </div>
                                        <AccessBadge role={roleSummary.role} approvalPosition={roleSummary.approval_position} />
                                    </Tile>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
                                    <Tile>
                                        <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} className="max-w-2xl" />
                                    </Tile>

                                    <Tile>
                                        <UpdatePasswordForm className="max-w-xl" />
                                    </Tile>
                                </div>
                            </section>
                        )}

                        {activeTab === 'security' && (
                            <section id="security" className="space-y-6">
                                <PanelHeader
                                    eyebrow="Security Settings"
                                    title="Authentication and Password Rules"
                                    description="Account-level security actions stay here, while password policy and timeout controls are visible as system defaults for privileged roles."
                                    action={twoFactorSetupHref ? <Button as={Link} href={twoFactorSetupHref} kind="primary" size="sm">Open 2FA Setup</Button> : null}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1rem' }}>
                                    <Tile>
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Authentication</p>
                                        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                            <div>
                                                <p style={{ margin: 0, color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>Two-Factor Authentication</p>
                                                <Tag type={roleSummary.two_factor_enabled ? 'green' : 'gray'} style={{ marginTop: '0.5rem' }}>
                                                    {roleSummary.two_factor_enabled ? 'Enabled' : 'Disabled'}
                                                </Tag>
                                            </div>
                                            <Select
                                                id="session-timeout"
                                                labelText="Session Timeout"
                                                value={String(securitySettings.session_timeout)}
                                                onChange={(event) => setSecuritySettings((current) => ({ ...current, session_timeout: Number(event.target.value) }))}
                                                disabled={!isPrivileged}
                                            >
                                                <SelectItem value="15" text="15 minutes" />
                                                <SelectItem value="30" text="30 minutes" />
                                                <SelectItem value="60" text="60 minutes" />
                                                <SelectItem value="120" text="120 minutes" />
                                            </Select>
                                        </div>
                                    </Tile>

                                    <Tile>
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Password Policy</p>
                                        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                            <RangeField
                                                id="password-min-length"
                                                label="Minimum password length"
                                                min={8}
                                                max={24}
                                                value={securitySettings.password_min_length}
                                                onChange={(value) => setSecuritySettings((current) => ({ ...current, password_min_length: value }))}
                                            />
                                            <Checkbox id="password-uppercase" labelText="Require uppercase letters" checked={securitySettings.require_uppercase} onChange={(event) => setSecuritySettings((current) => ({ ...current, require_uppercase: event.target.checked }))} disabled={!isPrivileged} />
                                            <Checkbox id="password-numbers" labelText="Require numbers" checked={securitySettings.require_numbers} onChange={(event) => setSecuritySettings((current) => ({ ...current, require_numbers: event.target.checked }))} disabled={!isPrivileged} />
                                            <Checkbox id="password-special" labelText="Require special characters" checked={securitySettings.require_special_characters} onChange={(event) => setSecuritySettings((current) => ({ ...current, require_special_characters: event.target.checked }))} disabled={!isPrivileged} />
                                        </div>
                                    </Tile>
                                </div>
                            </section>
                        )}

                        {activeTab === 'assets' && isPrivileged && (
                            <section id="assets" className="space-y-6">
                                <PanelHeader
                                    eyebrow="Asset Management Settings"
                                    title="Categories, Maintenance, and QR Controls"
                                    description="These controls shape the asset workflow across the estate, so they are reserved for admin and executive review."
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1rem' }}>
                                    <Tile>
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Asset Categories</p>
                                        <p style={{ margin: '0.5rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>Current predefined categories in the system.</p>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                                            {assetSettings.categories.map((category) => (
                                                <Tag key={category} type="cool-gray">{category}</Tag>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: '1rem' }}>
                                            <Checkbox id="allow-custom-categories" labelText="Allow Custom Categories" checked={assetSettings.allow_custom_categories} onChange={(event) => setAssetSettings((current) => ({ ...current, allow_custom_categories: event.target.checked }))} />
                                        </div>
                                    </Tile>

                                    <Tile>
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Asset Conditions</p>
                                        <div style={{ marginTop: '1rem' }}>
                                            <RangeField
                                                id="auto-flag-age"
                                                label="Auto-flag asset age"
                                                min={1}
                                                max={15}
                                                value={assetSettings.auto_flag_asset_age_years}
                                                suffix=" years"
                                                helperText="Assets older than this threshold can be surfaced for review in future reporting passes."
                                                onChange={(value) => setAssetSettings((current) => ({ ...current, auto_flag_asset_age_years: value }))}
                                            />
                                        </div>
                                    </Tile>

                                    <Tile>
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Maintenance Settings</p>
                                        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                            <TextInput id="maintenance-interval" labelText="Maintenance interval (days)" type="number" value={String(assetSettings.maintenance_interval_days)} onChange={(event) => setAssetSettings((current) => ({ ...current, maintenance_interval_days: Number(event.target.value) }))} />
                                            <TextInput id="maintenance-reminder" labelText="Reminder lead time (days)" type="number" value={String(assetSettings.maintenance_reminder_lead_days)} onChange={(event) => setAssetSettings((current) => ({ ...current, maintenance_reminder_lead_days: Number(event.target.value) }))} />
                                            <Checkbox id="maintenance-auto-send" labelText="Auto-send reminders" checked={assetSettings.maintenance_auto_send} onChange={(event) => setAssetSettings((current) => ({ ...current, maintenance_auto_send: event.target.checked }))} />
                                        </div>
                                    </Tile>

                                    <Tile>
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Barcode & QR Settings</p>
                                        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                            <Select id="qr-code-format" labelText="QR code format" value={assetSettings.qr_code_format} onChange={(event) => setAssetSettings((current) => ({ ...current, qr_code_format: event.target.value }))}>
                                                <SelectItem value="PNG" text="PNG" />
                                                <SelectItem value="SVG" text="SVG" />
                                                <SelectItem value="PDF" text="PDF" />
                                            </Select>
                                            <Checkbox id="auto-generate-asset-ids" labelText="Auto-generate Asset IDs" checked={assetSettings.auto_generate_asset_ids} onChange={(event) => setAssetSettings((current) => ({ ...current, auto_generate_asset_ids: event.target.checked }))} />
                                        </div>
                                    </Tile>
                                </div>
                            </section>
                        )}

                        {activeTab === 'system' && isPrivileged && (
                            <section id="system" className="space-y-6">
                                <PanelHeader
                                    eyebrow="System Configuration"
                                    title="General, SMTP, and User Governance"
                                    description="System defaults and organization-level controls are grouped here without the duplicate navigation buttons that previously cluttered the page."
                                    action={isExecutive && usersIndexHref ? <Button as={Link} href={usersIndexHref} kind="tertiary" size="sm">Open User Access</Button> : null}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1rem' }}>
                                    <Tile>
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>General Settings</p>
                                        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                            <TextInput id="organization-name" labelText="Organization name" value={systemSettings.organization_name} onChange={(event) => setSystemSettings((current) => ({ ...current, organization_name: event.target.value }))} />
                                            <TextInput id="timezone" labelText="Timezone" value={systemSettings.timezone} onChange={(event) => setSystemSettings((current) => ({ ...current, timezone: event.target.value }))} />
                                            <TextInput id="date-format" labelText="Date format" value={systemSettings.date_format} onChange={(event) => setSystemSettings((current) => ({ ...current, date_format: event.target.value }))} />
                                            <TextInput id="currency" labelText="Currency" value={systemSettings.currency} onChange={(event) => setSystemSettings((current) => ({ ...current, currency: event.target.value }))} />
                                            <TextInput id="language" labelText="Language" value={systemSettings.language} onChange={(event) => setSystemSettings((current) => ({ ...current, language: event.target.value }))} />
                                        </div>
                                    </Tile>

                                    <Tile>
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Email / SMTP Settings</p>
                                        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                            <TextInput id="smtp-host" labelText="SMTP host" value={systemSettings.smtp_host} onChange={(event) => setSystemSettings((current) => ({ ...current, smtp_host: event.target.value }))} />
                                            <TextInput id="smtp-port" labelText="SMTP port" value={systemSettings.smtp_port} onChange={(event) => setSystemSettings((current) => ({ ...current, smtp_port: event.target.value }))} />
                                            <TextInput id="smtp-username" labelText="SMTP username" value={systemSettings.smtp_username} onChange={(event) => setSystemSettings((current) => ({ ...current, smtp_username: event.target.value }))} />
                                            <TextInput id="smtp-password" type="password" labelText="SMTP password" value={systemSettings.smtp_password} onChange={(event) => setSystemSettings((current) => ({ ...current, smtp_password: event.target.value }))} />
                                            <TextInput id="sender-name" labelText="Sender name" value={systemSettings.sender_name} onChange={(event) => setSystemSettings((current) => ({ ...current, sender_name: event.target.value }))} />
                                            <TextInput id="sender-email" labelText="Sender email" value={systemSettings.sender_email} onChange={(event) => setSystemSettings((current) => ({ ...current, sender_email: event.target.value }))} />
                                            <Checkbox id="smtp-tls" labelText="Use TLS / SSL" checked={systemSettings.smtp_tls_enabled} onChange={(event) => setSystemSettings((current) => ({ ...current, smtp_tls_enabled: event.target.checked }))} />
                                            <Button kind="secondary" size="sm" disabled>Test Email Connection</Button>
                                        </div>
                                    </Tile>

                                    <Tile>
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>User Management</p>
                                        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                            <Checkbox id="executive-approval-users" labelText="Require executive approval for new users" checked={systemSettings.require_executive_approval_for_new_users} onChange={(event) => setSystemSettings((current) => ({ ...current, require_executive_approval_for_new_users: event.target.checked }))} />
                                            <Checkbox id="auto-deactivate-users" labelText="Auto-deactivate inactive users" checked={systemSettings.auto_deactivate_inactive_users} onChange={(event) => setSystemSettings((current) => ({ ...current, auto_deactivate_inactive_users: event.target.checked }))} />
                                            <TextInput id="inactive-days" labelText="Inactivity days" type="number" value={String(systemSettings.inactive_days)} onChange={(event) => setSystemSettings((current) => ({ ...current, inactive_days: Number(event.target.value) }))} />
                                            {isExecutive && <p style={{ margin: 0, color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>Executives own user invitations and role assignment for the platform.</p>}
                                        </div>
                                    </Tile>
                                </div>
                            </section>
                        )}

                        {activeTab === 'backup' && isPrivileged && (
                            <section id="backup" className="space-y-6">
                                <PanelHeader
                                    eyebrow="Backup & Data Management"
                                    title="Retention and Backup Controls"
                                    description="Backup and retention defaults are collected in one place for operational review. Manual actions are shown once here, without duplicated links elsewhere in settings."
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1rem' }}>
                                    <Tile>
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Automatic Backups</p>
                                        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                            <Checkbox id="auto-backup-enabled" labelText="Enable Auto-Backup" checked={backupSettings.auto_backup_enabled} onChange={(event) => setBackupSettings((current) => ({ ...current, auto_backup_enabled: event.target.checked }))} />
                                            <Select id="backup-frequency" labelText="Backup frequency" value={backupSettings.backup_frequency} onChange={(event) => setBackupSettings((current) => ({ ...current, backup_frequency: event.target.value }))}>
                                                <SelectItem value="daily" text="Daily" />
                                                <SelectItem value="weekly" text="Weekly" />
                                                <SelectItem value="monthly" text="Monthly" />
                                            </Select>
                                            <TextInput id="backup-time" labelText="Backup time" type="time" value={backupSettings.backup_time} onChange={(event) => setBackupSettings((current) => ({ ...current, backup_time: event.target.value }))} />
                                            <RangeField id="backup-retention" label="Retention period" min={7} max={365} value={backupSettings.retention_days} suffix=" days" onChange={(value) => setBackupSettings((current) => ({ ...current, retention_days: value }))} />
                                            <Select id="backup-destination" labelText="Backup destination" value={backupSettings.backup_destination} onChange={(event) => setBackupSettings((current) => ({ ...current, backup_destination: event.target.value }))}>
                                                <SelectItem value="local" text="Local" />
                                                <SelectItem value="cloud" text="Cloud" />
                                                <SelectItem value="ftp" text="FTP" />
                                            </Select>
                                        </div>
                                    </Tile>

                                    <Tile>
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Data Retention</p>
                                        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                            <Select id="activity-log-retention" labelText="Keep Activity Logs For" value={backupSettings.activity_log_retention} onChange={(event) => setBackupSettings((current) => ({ ...current, activity_log_retention: event.target.value }))}>
                                                <SelectItem value="30 days" text="30 days" />
                                                <SelectItem value="90 days" text="90 days" />
                                                <SelectItem value="365 days" text="365 days" />
                                                <SelectItem value="Forever" text="Forever" />
                                            </Select>
                                            <Select id="deleted-assets-retention" labelText="Keep Deleted Assets For" value={backupSettings.deleted_asset_retention} onChange={(event) => setBackupSettings((current) => ({ ...current, deleted_asset_retention: event.target.value }))}>
                                                <SelectItem value="30 days" text="30 days" />
                                                <SelectItem value="90 days" text="90 days" />
                                                <SelectItem value="Permanent" text="Permanently retain" />
                                            </Select>
                                            <Checkbox id="auto-purge-expired-data" labelText="Auto-purge expired data" checked={backupSettings.auto_purge_expired_data} onChange={(event) => setBackupSettings((current) => ({ ...current, auto_purge_expired_data: event.target.checked }))} />
                                        </div>
                                    </Tile>

                                    <Tile>
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Manual Backup Actions</p>
                                        <p style={{ margin: '0.5rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                                            Manual backup execution is intentionally shown once here so the settings page no longer repeats operational buttons across multiple tiles.
                                        </p>
                                        <div style={{ marginTop: '1rem' }}>
                                            <Button kind="primary" size="sm" disabled>Create Backup Now</Button>
                                        </div>
                                    </Tile>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
        </AuthenticatedLayout>
    );
}