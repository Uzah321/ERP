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
                    <p style={{ fontWeight: 700, color: '#da1e28', marginBottom: '0.5rem' }}>Settings page error:</p>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.8rem' }}>{String(this.state.error)}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

import { Head, Link, useForm } from '@inertiajs/react';
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

const roleText   = { executive: 'Executive Access', admin: 'Admin Access', user: 'User Access' };
const roleTone   = { executive: 'red', admin: 'purple', user: 'gray' };
const approvalText = {
    it_manager: 'IT Manager',
    finance_operations: 'Finance Operations',
    it_head: 'IT Head of Technology',
    finance_director: 'Finance Director',
};

const privilegedTabs = [
    { id: 'profile',  label: 'Profile Settings' },
    { id: 'security', label: 'Security Settings' },
    { id: 'assets',   label: 'Asset Settings' },
    { id: 'system',   label: 'System Configuration' },
    { id: 'backup',   label: 'Backup & Data' },
];
const basicTabs = privilegedTabs.slice(0, 2);

function hashTabId(tabs) {
    if (typeof window === 'undefined') return tabs[0].id;
    const hash = window.location.hash.replace('#', '');
    return tabs.some(t => t.id === hash) ? hash : tabs[0].id;
}

function RangeField({ id, label, min, max, step = 1, value, suffix = '', onChange, helperText }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label htmlFor={id} style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>{label}</label>
                <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{value}{suffix}</span>
            </div>
            <input id={id} type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                style={{ width: '100%' }} />
            {helperText && <p style={{ margin: '0.375rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.75rem' }}>{helperText}</p>}
        </div>
    );
}

function SectionHeader({ title, description, action }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div>
                <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>{title}</h2>
                {description && <p style={{ margin: '0.375rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{description}</p>}
            </div>
            {action}
        </div>
    );
}

function CardLabel({ children }) {
    return <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)', borderBottom: '1px solid var(--cds-border-subtle)', paddingBottom: '0.625rem' }}>{children}</p>;
}

function SaveBar({ processing, label = 'Save changes' }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--cds-border-subtle)', marginTop: '1rem' }}>
            <Button type="submit" disabled={processing} size="sm">
                {processing ? 'Saving…' : label}
            </Button>
        </div>
    );
}

function FlashNotice({ flash }) {
    if (!flash?.success) return null;
    return (
        <InlineNotification
            kind="success"
            title={flash.success}
            lowContrast
            hideCloseButton
            style={{ marginBottom: '1.5rem' }}
        />
    );
}

export default function SettingsIndex({ auth, mustVerifyEmail, status, roleSummary, settingsDefaults: sd, flash }) {
    const defaults = sd ?? {
        profile:  { first_name: '', last_name: '', email: '', phone: '', department: 'Unassigned', job_title: '' },
        security: { session_timeout: 30, password_min_length: 12, require_uppercase: true, require_numbers: true, require_special_characters: true },
        assets:   { categories: [], allow_custom_categories: true, auto_flag_asset_age_years: 5, maintenance_interval_days: 180, maintenance_reminder_lead_days: 14, maintenance_auto_send: true, qr_code_format: 'PNG', auto_generate_asset_ids: true },
        system:   { organization_name: '', timezone: 'UTC', date_format: 'Y-m-d', currency: 'USD', language: 'en', smtp_host: '', smtp_port: '', smtp_username: '', smtp_password: '', sender_name: '', sender_email: '', smtp_tls_enabled: false, require_executive_approval_for_new_users: true, auto_deactivate_inactive_users: true, inactive_days: 90 },
        backup:   { auto_backup_enabled: false, backup_frequency: 'weekly', backup_time: '02:00', retention_days: 30, backup_destination: 'local', activity_log_retention: '365 days', deleted_asset_retention: '90 days', auto_purge_expired_data: false },
    };

    const isAdmin      = auth.user.role === 'admin'      || auth.user.is_super_user === true;
    const isExecutive  = auth.user.role === 'executive'   || auth.user.is_super_user === true;
    const isPrivileged = isAdmin || isExecutive;
    const tabs = isPrivileged ? privilegedTabs : basicTabs;

    const twoFactorSetupHref = safeRoute('two-factor.setup');
    const usersIndexHref     = safeRoute('admin.users.index');

    const [activeTab, setActiveTab] = useState(hashTabId(tabs));

    useEffect(() => {
        const sync = () => setActiveTab(hashTabId(tabs));
        sync();
        window.addEventListener('hashchange', sync);
        return () => window.removeEventListener('hashchange', sync);
    }, [tabs]);

    // ── Security form ──────────────────────────────────────────────────
    const secForm = useForm({
        session_timeout:           defaults.security.session_timeout,
        password_min_length:        defaults.security.password_min_length,
        require_uppercase:          defaults.security.require_uppercase,
        require_numbers:            defaults.security.require_numbers,
        require_special_characters: defaults.security.require_special_characters,
    });

    // ── Asset Settings form ────────────────────────────────────────────
    const assetForm = useForm({
        allow_custom_categories:        defaults.assets.allow_custom_categories,
        auto_flag_asset_age_years:      defaults.assets.auto_flag_asset_age_years,
        maintenance_interval_days:      defaults.assets.maintenance_interval_days,
        maintenance_reminder_lead_days: defaults.assets.maintenance_reminder_lead_days,
        maintenance_auto_send:          defaults.assets.maintenance_auto_send,
        qr_code_format:                 defaults.assets.qr_code_format,
        auto_generate_asset_ids:        defaults.assets.auto_generate_asset_ids,
    });

    // ── System form ────────────────────────────────────────────────────
    const sysForm = useForm({
        organization_name:                        defaults.system.organization_name,
        timezone:                                 defaults.system.timezone,
        date_format:                              defaults.system.date_format,
        currency:                                 defaults.system.currency,
        language:                                 defaults.system.language,
        smtp_host:                                defaults.system.smtp_host,
        smtp_port:                                defaults.system.smtp_port,
        smtp_username:                            defaults.system.smtp_username,
        smtp_password:                            defaults.system.smtp_password,
        sender_name:                              defaults.system.sender_name,
        sender_email:                             defaults.system.sender_email,
        smtp_tls_enabled:                         defaults.system.smtp_tls_enabled,
        require_executive_approval_for_new_users: defaults.system.require_executive_approval_for_new_users,
        auto_deactivate_inactive_users:           defaults.system.auto_deactivate_inactive_users,
        inactive_days:                            defaults.system.inactive_days,
    });

    // ── Backup form ────────────────────────────────────────────────────
    const backupForm = useForm({
        auto_backup_enabled:      defaults.backup.auto_backup_enabled,
        backup_frequency:         defaults.backup.backup_frequency,
        backup_time:              defaults.backup.backup_time,
        retention_days:           defaults.backup.retention_days,
        backup_destination:       defaults.backup.backup_destination,
        activity_log_retention:   defaults.backup.activity_log_retention,
        deleted_asset_retention:  defaults.backup.deleted_asset_retention,
        auto_purge_expired_data:  defaults.backup.auto_purge_expired_data,
    });

    const submitSec    = e => { e.preventDefault(); secForm.post(route('settings.security'),    { preserveScroll: true }); };
    const submitAsset  = e => { e.preventDefault(); assetForm.post(route('settings.assets'),    { preserveScroll: true }); };
    const submitSys    = e => { e.preventDefault(); sysForm.post(route('settings.system'),      { preserveScroll: true }); };
    const submitBackup = e => { e.preventDefault(); backupForm.post(route('settings.backup'),   { preserveScroll: true }); };

    const grid2  = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1rem' };
    const stack  = { display: 'grid', gap: '1rem' };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Settings" />
            <ErrorBoundary>
            <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem' }}>

                {/* Page title */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                            {tabs.find(t => t.id === activeTab)?.label ?? 'Settings'}
                        </h1>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            <Tag type={roleTone[roleSummary.role] ?? 'gray'} size="sm">{roleText[roleSummary.role] ?? 'User Access'}</Tag>
                            {roleSummary.approval_position && (
                                <Tag type="cool-gray" size="sm">{approvalText[roleSummary.approval_position] ?? roleSummary.approval_position}</Tag>
                            )}
                            <Tag type={roleSummary.two_factor_enabled ? 'green' : 'gray'} size="sm">
                                {roleSummary.two_factor_enabled ? '2FA on' : '2FA off'}
                            </Tag>
                        </div>
                    </div>
                </div>

                <FlashNotice flash={flash} />

                {/* ── Profile ─────────────────────────────────────────── */}
                {activeTab === 'profile' && (
                    <div style={stack}>
                        <SectionHeader title="Personal Information" description="Your account identity and contact details." />
                        <div style={grid2}>
                            <Tile>
                                <CardLabel>Profile Snapshot</CardLabel>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <TextInput id="s-first" labelText="First Name" value={defaults.profile.first_name || 'Not set'} readOnly />
                                    <TextInput id="s-last"  labelText="Last Name"  value={defaults.profile.last_name  || 'Not set'} readOnly />
                                    <TextInput id="s-email" labelText="Email"      value={defaults.profile.email || ''} readOnly />
                                    <TextInput id="s-phone" labelText="Phone"      value={defaults.profile.phone || 'Not configured'} readOnly />
                                    <TextInput id="s-dept"  labelText="Department" value={defaults.profile.department || 'Unassigned'} readOnly />
                                    <TextInput id="s-title" labelText="Job Title"  value={defaults.profile.job_title || 'Not configured'} readOnly />
                                </div>
                                <div style={{ marginTop: '1rem' }}>
                                    <TextInput id="s-access" labelText="Access Level" value={roleText[roleSummary.role] ?? 'User Access'} readOnly helperText="Assigned by executives — not editable here." />
                                </div>
                            </Tile>
                            <Tile>
                                <CardLabel>Profile Picture</CardLabel>
                                <FileUploader
                                    labelTitle=""
                                    labelDescription="PNG, JPG, or WebP"
                                    buttonLabel="Choose image"
                                    accept={['image/jpeg', 'image/png', 'image/jpg', 'image/webp']}
                                    disabled
                                />
                            </Tile>
                        </div>
                        <div style={grid2}>
                            <Tile>
                                <CardLabel>Edit Profile</CardLabel>
                                <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                            </Tile>
                            <Tile>
                                <CardLabel>Change Password</CardLabel>
                                <UpdatePasswordForm />
                            </Tile>
                        </div>
                    </div>
                )}

                {/* ── Security ─────────────────────────────────────────── */}
                {activeTab === 'security' && (
                    <div style={stack}>
                        <SectionHeader
                            title="Authentication & Security"
                            description="Two-factor authentication, session timeout, and password rules."
                            action={twoFactorSetupHref
                                ? <Button as={Link} href={twoFactorSetupHref} kind="primary" size="sm">Open 2FA Setup</Button>
                                : null}
                        />
                        <form onSubmit={submitSec}>
                            <div style={grid2}>
                                <Tile>
                                    <CardLabel>Two-Factor Authentication</CardLabel>
                                    <div style={stack}>
                                        <div>
                                            <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Current status</p>
                                            <Tag type={roleSummary.two_factor_enabled ? 'green' : 'gray'}>
                                                {roleSummary.two_factor_enabled ? 'Enabled' : 'Disabled'}
                                            </Tag>
                                        </div>
                                        <Select
                                            id="session-timeout"
                                            labelText="Session Timeout"
                                            value={String(secForm.data.session_timeout)}
                                            onChange={e => secForm.setData('session_timeout', Number(e.target.value))}
                                            disabled={!isPrivileged}
                                        >
                                            <SelectItem value="15"  text="15 minutes" />
                                            <SelectItem value="30"  text="30 minutes" />
                                            <SelectItem value="60"  text="60 minutes" />
                                            <SelectItem value="120" text="120 minutes" />
                                        </Select>
                                    </div>
                                </Tile>
                                <Tile>
                                    <CardLabel>Password Policy</CardLabel>
                                    <div style={stack}>
                                        <RangeField
                                            id="pw-min"
                                            label="Minimum length"
                                            min={8} max={24}
                                            value={secForm.data.password_min_length}
                                            onChange={v => secForm.setData('password_min_length', v)}
                                        />
                                        <Checkbox id="pw-upper"   labelText="Require uppercase letters"    checked={secForm.data.require_uppercase}          onChange={e => secForm.setData('require_uppercase',          e.target.checked)} disabled={!isPrivileged} />
                                        <Checkbox id="pw-numbers" labelText="Require numbers"              checked={secForm.data.require_numbers}            onChange={e => secForm.setData('require_numbers',            e.target.checked)} disabled={!isPrivileged} />
                                        <Checkbox id="pw-special" labelText="Require special characters"   checked={secForm.data.require_special_characters} onChange={e => secForm.setData('require_special_characters', e.target.checked)} disabled={!isPrivileged} />
                                    </div>
                                </Tile>
                            </div>
                            {isPrivileged && <SaveBar processing={secForm.processing} />}
                        </form>
                    </div>
                )}

                {/* ── Asset Settings ───────────────────────────────────── */}
                {activeTab === 'assets' && isPrivileged && (
                    <div style={stack}>
                        <SectionHeader title="Asset Settings" description="Categories, maintenance schedules, and barcode configuration." />
                        <form onSubmit={submitAsset}>
                            <div style={grid2}>
                                <Tile>
                                    <CardLabel>Asset Categories</CardLabel>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                        {defaults.assets.categories.map(c => <Tag key={c} type="cool-gray" size="sm">{c}</Tag>)}
                                        {defaults.assets.categories.length === 0 && <span style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>No categories defined.</span>}
                                    </div>
                                    <Checkbox
                                        id="allow-custom"
                                        labelText="Allow custom categories"
                                        checked={assetForm.data.allow_custom_categories}
                                        onChange={e => assetForm.setData('allow_custom_categories', e.target.checked)}
                                    />
                                </Tile>
                                <Tile>
                                    <CardLabel>Asset Condition Thresholds</CardLabel>
                                    <RangeField
                                        id="flag-age"
                                        label="Auto-flag age"
                                        min={1} max={15}
                                        value={assetForm.data.auto_flag_asset_age_years}
                                        suffix=" years"
                                        helperText="Assets older than this are surfaced for review in reports."
                                        onChange={v => assetForm.setData('auto_flag_asset_age_years', v)}
                                    />
                                </Tile>
                                <Tile>
                                    <CardLabel>Maintenance Settings</CardLabel>
                                    <div style={stack}>
                                        <TextInput id="maint-interval" labelText="Maintenance interval (days)" type="number"
                                            value={String(assetForm.data.maintenance_interval_days)}
                                            onChange={e => assetForm.setData('maintenance_interval_days', Number(e.target.value))} />
                                        <TextInput id="maint-lead" labelText="Reminder lead time (days)" type="number"
                                            value={String(assetForm.data.maintenance_reminder_lead_days)}
                                            onChange={e => assetForm.setData('maintenance_reminder_lead_days', Number(e.target.value))} />
                                        <Checkbox id="maint-auto" labelText="Auto-send reminders"
                                            checked={assetForm.data.maintenance_auto_send}
                                            onChange={e => assetForm.setData('maintenance_auto_send', e.target.checked)} />
                                    </div>
                                </Tile>
                                <Tile>
                                    <CardLabel>Barcode & QR Settings</CardLabel>
                                    <div style={stack}>
                                        <Select id="qr-format" labelText="QR code format"
                                            value={assetForm.data.qr_code_format}
                                            onChange={e => assetForm.setData('qr_code_format', e.target.value)}>
                                            <SelectItem value="PNG" text="PNG" />
                                            <SelectItem value="SVG" text="SVG" />
                                            <SelectItem value="PDF" text="PDF" />
                                        </Select>
                                        <Checkbox id="auto-gen-ids" labelText="Auto-generate Asset IDs"
                                            checked={assetForm.data.auto_generate_asset_ids}
                                            onChange={e => assetForm.setData('auto_generate_asset_ids', e.target.checked)} />
                                    </div>
                                </Tile>
                            </div>
                            <SaveBar processing={assetForm.processing} />
                        </form>
                    </div>
                )}

                {/* ── System Configuration ─────────────────────────────── */}
                {activeTab === 'system' && isPrivileged && (
                    <div style={stack}>
                        <SectionHeader
                            title="System Configuration"
                            description="Organization details, SMTP, and user governance controls."
                            action={isExecutive && usersIndexHref
                                ? <Button as={Link} href={usersIndexHref} kind="tertiary" size="sm">Manage Users</Button>
                                : null}
                        />
                        <form onSubmit={submitSys}>
                            <div style={grid2}>
                                <Tile>
                                    <CardLabel>General</CardLabel>
                                    <div style={stack}>
                                        <TextInput id="org-name"    labelText="Organization name" value={sysForm.data.organization_name} onChange={e => sysForm.setData('organization_name', e.target.value)} />
                                        <TextInput id="timezone"    labelText="Timezone"          value={sysForm.data.timezone}          onChange={e => sysForm.setData('timezone',           e.target.value)} />
                                        <TextInput id="date-format" labelText="Date format"       value={sysForm.data.date_format}       onChange={e => sysForm.setData('date_format',        e.target.value)} />
                                        <TextInput id="currency"    labelText="Currency"          value={sysForm.data.currency}          onChange={e => sysForm.setData('currency',           e.target.value)} />
                                        <TextInput id="language"    labelText="Language"          value={sysForm.data.language}          onChange={e => sysForm.setData('language',           e.target.value)} />
                                    </div>
                                </Tile>
                                <Tile>
                                    <CardLabel>Email / SMTP</CardLabel>
                                    <div style={stack}>
                                        <TextInput id="smtp-host"  labelText="SMTP host"     value={sysForm.data.smtp_host}     onChange={e => sysForm.setData('smtp_host',     e.target.value)} />
                                        <TextInput id="smtp-port"  labelText="SMTP port"     value={sysForm.data.smtp_port}     onChange={e => sysForm.setData('smtp_port',     e.target.value)} />
                                        <TextInput id="smtp-user"  labelText="SMTP username" value={sysForm.data.smtp_username} onChange={e => sysForm.setData('smtp_username', e.target.value)} />
                                        <TextInput id="smtp-pass"  type="password" labelText="SMTP password" value={sysForm.data.smtp_password} onChange={e => sysForm.setData('smtp_password', e.target.value)} />
                                        <TextInput id="from-name"  labelText="Sender name"   value={sysForm.data.sender_name}  onChange={e => sysForm.setData('sender_name',  e.target.value)} />
                                        <TextInput id="from-email" labelText="Sender email"  value={sysForm.data.sender_email} onChange={e => sysForm.setData('sender_email', e.target.value)} />
                                        <Checkbox  id="smtp-tls"   labelText="Use TLS / SSL" checked={sysForm.data.smtp_tls_enabled} onChange={e => sysForm.setData('smtp_tls_enabled', e.target.checked)} />
                                    </div>
                                </Tile>
                                <Tile>
                                    <CardLabel>User Governance</CardLabel>
                                    <div style={stack}>
                                        <Checkbox id="exec-approval"   labelText="Require executive approval for new users" checked={sysForm.data.require_executive_approval_for_new_users} onChange={e => sysForm.setData('require_executive_approval_for_new_users', e.target.checked)} />
                                        <Checkbox id="auto-deactivate" labelText="Auto-deactivate inactive users"           checked={sysForm.data.auto_deactivate_inactive_users}           onChange={e => sysForm.setData('auto_deactivate_inactive_users',           e.target.checked)} />
                                        <TextInput id="inactive-days"  labelText="Inactivity threshold (days)" type="number"
                                            value={String(sysForm.data.inactive_days)}
                                            onChange={e => sysForm.setData('inactive_days', Number(e.target.value))} />
                                    </div>
                                </Tile>
                            </div>
                            <SaveBar processing={sysForm.processing} />
                        </form>
                    </div>
                )}

                {/* ── Backup & Data ────────────────────────────────────── */}
                {activeTab === 'backup' && isPrivileged && (
                    <div style={stack}>
                        <SectionHeader title="Backup & Data Management" description="Automated backup schedules and data retention policies." />
                        <form onSubmit={submitBackup}>
                            <div style={grid2}>
                                <Tile>
                                    <CardLabel>Automatic Backups</CardLabel>
                                    <div style={stack}>
                                        <Checkbox id="auto-backup" labelText="Enable auto-backup"
                                            checked={backupForm.data.auto_backup_enabled}
                                            onChange={e => backupForm.setData('auto_backup_enabled', e.target.checked)} />
                                        <Select id="backup-freq" labelText="Frequency"
                                            value={backupForm.data.backup_frequency}
                                            onChange={e => backupForm.setData('backup_frequency', e.target.value)}>
                                            <SelectItem value="daily"   text="Daily" />
                                            <SelectItem value="weekly"  text="Weekly" />
                                            <SelectItem value="monthly" text="Monthly" />
                                        </Select>
                                        <TextInput id="backup-time" labelText="Backup time" type="time"
                                            value={backupForm.data.backup_time}
                                            onChange={e => backupForm.setData('backup_time', e.target.value)} />
                                        <RangeField id="backup-ret" label="Retention period" min={7} max={365}
                                            value={backupForm.data.retention_days} suffix=" days"
                                            onChange={v => backupForm.setData('retention_days', v)} />
                                        <Select id="backup-dest" labelText="Destination"
                                            value={backupForm.data.backup_destination}
                                            onChange={e => backupForm.setData('backup_destination', e.target.value)}>
                                            <SelectItem value="local" text="Local" />
                                            <SelectItem value="cloud" text="Cloud" />
                                            <SelectItem value="ftp"   text="FTP" />
                                        </Select>
                                    </div>
                                </Tile>
                                <Tile>
                                    <CardLabel>Data Retention</CardLabel>
                                    <div style={stack}>
                                        <Select id="log-ret" labelText="Keep activity logs for"
                                            value={backupForm.data.activity_log_retention}
                                            onChange={e => backupForm.setData('activity_log_retention', e.target.value)}>
                                            <SelectItem value="30 days"  text="30 days" />
                                            <SelectItem value="90 days"  text="90 days" />
                                            <SelectItem value="365 days" text="365 days" />
                                            <SelectItem value="Forever"  text="Forever" />
                                        </Select>
                                        <Select id="del-ret" labelText="Keep deleted assets for"
                                            value={backupForm.data.deleted_asset_retention}
                                            onChange={e => backupForm.setData('deleted_asset_retention', e.target.value)}>
                                            <SelectItem value="30 days"   text="30 days" />
                                            <SelectItem value="90 days"   text="90 days" />
                                            <SelectItem value="Permanent" text="Permanently retain" />
                                        </Select>
                                        <Checkbox id="auto-purge" labelText="Auto-purge expired data"
                                            checked={backupForm.data.auto_purge_expired_data}
                                            onChange={e => backupForm.setData('auto_purge_expired_data', e.target.checked)} />
                                    </div>
                                </Tile>
                                <Tile>
                                    <CardLabel>Manual Actions</CardLabel>
                                    <Button kind="primary" size="sm" disabled>Create Backup Now</Button>
                                </Tile>
                            </div>
                            <SaveBar processing={backupForm.processing} />
                        </form>
                    </div>
                )}

            </div>
            </ErrorBoundary>
        </AuthenticatedLayout>
    );
}
