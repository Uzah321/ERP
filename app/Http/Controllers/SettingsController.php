<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use App\Models\Category;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user()->load('department');
        $smtpConfig = config('mail.mailers.smtp', []);
        $firstName = Str::of($user->name ?? '')->before(' ')->value();
        $lastName  = Str::of($user->name ?? '')->after(' ')->whenEmpty(fn () => '')->value();

        $security = AppSetting::group('security');
        $assets   = AppSetting::group('assets');
        $system   = AppSetting::group('system');
        $backup   = AppSetting::group('backup');

        return Inertia::render('Settings/Index', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status'          => session('status'),
            'roleSummary'     => [
                'role'               => $user->role,
                'approval_position'  => $user->approval_position,
                'two_factor_enabled' => $user->two_factor_enabled,
                'department_name'    => $user->department?->name ?? 'Unassigned',
            ],
            'settingsDefaults' => [
                'profile' => [
                    'first_name'            => $firstName,
                    'last_name'             => $lastName,
                    'email'                 => $user->email,
                    'phone'                 => $user->phone ?? '',
                    'department'            => $user->department?->name ?? 'Unassigned',
                    'job_title'             => $user->approval_position
                        ? Str::of($user->approval_position)->replace('_', ' ')->title()->value()
                        : Str::headline($user->role),
                    'profile_picture_label' => 'Profile picture upload is staged for a later backend pass.',
                ],
                'security' => [
                    'session_timeout'            => (int) ($security['session_timeout'] ?? 30),
                    'password_min_length'         => (int) ($security['password_min_length'] ?? 12),
                    'require_uppercase'           => ($security['require_uppercase'] ?? '1') === '1',
                    'require_numbers'             => ($security['require_numbers'] ?? '1') === '1',
                    'require_special_characters'  => ($security['require_special_characters'] ?? '1') === '1',
                ],
                'assets' => [
                    'categories'                   => Category::orderBy('name')->pluck('name')->values()->all(),
                    'allow_custom_categories'      => ($assets['allow_custom_categories'] ?? '1') === '1',
                    'auto_flag_asset_age_years'    => (int) ($assets['auto_flag_asset_age_years'] ?? 5),
                    'maintenance_interval_days'    => (int) ($assets['maintenance_interval_days'] ?? 180),
                    'maintenance_reminder_lead_days' => (int) ($assets['maintenance_reminder_lead_days'] ?? 14),
                    'maintenance_auto_send'        => ($assets['maintenance_auto_send'] ?? '1') === '1',
                    'qr_code_format'               => $assets['qr_code_format'] ?? 'PNG',
                    'auto_generate_asset_ids'      => ($assets['auto_generate_asset_ids'] ?? '1') === '1',
                ],
                'system' => [
                    'organization_name'                       => $system['organization_name'] ?? config('app.name', 'ASSETLINQ'),
                    'timezone'                                => $system['timezone'] ?? config('app.timezone', 'UTC'),
                    'date_format'                             => $system['date_format'] ?? 'Y-m-d',
                    'currency'                                => $system['currency'] ?? 'USD',
                    'language'                                => $system['language'] ?? config('app.locale', 'en'),
                    'smtp_host'                               => $system['smtp_host'] ?? ($smtpConfig['host'] ?? ''),
                    'smtp_port'                               => $system['smtp_port'] ?? (string) ($smtpConfig['port'] ?? ''),
                    'smtp_username'                           => $system['smtp_username'] ?? ($smtpConfig['username'] ?? ''),
                    'smtp_password'                           => $system['smtp_password'] ?? ($smtpConfig['password'] ?? ''),
                    'sender_name'                             => $system['sender_name'] ?? config('mail.from.name', config('app.name', 'ASSETLINQ')),
                    'sender_email'                            => $system['sender_email'] ?? config('mail.from.address', ''),
                    'smtp_tls_enabled'                        => ($system['smtp_tls_enabled'] ?? (in_array($smtpConfig['encryption'] ?? null, ['tls', 'ssl'], true) ? '1' : '0')) === '1',
                    'require_executive_approval_for_new_users' => ($system['require_executive_approval_for_new_users'] ?? '1') === '1',
                    'auto_deactivate_inactive_users'          => ($system['auto_deactivate_inactive_users'] ?? '1') === '1',
                    'inactive_days'                           => (int) ($system['inactive_days'] ?? 90),
                ],
                'backup' => [
                    'auto_backup_enabled'      => ($backup['auto_backup_enabled'] ?? '0') === '1',
                    'backup_frequency'         => $backup['backup_frequency'] ?? 'weekly',
                    'backup_time'              => $backup['backup_time'] ?? '02:00',
                    'retention_days'           => (int) ($backup['retention_days'] ?? 30),
                    'backup_destination'       => $backup['backup_destination'] ?? 'local',
                    'activity_log_retention'   => $backup['activity_log_retention'] ?? '365 days',
                    'deleted_asset_retention'  => $backup['deleted_asset_retention'] ?? '90 days',
                    'auto_purge_expired_data'  => ($backup['auto_purge_expired_data'] ?? '0') === '1',
                ],
            ],
        ]);
    }

    public function updateSecurity(Request $request)
    {
        $this->authorizePrivileged();
        $validated = $request->validate([
            'session_timeout'           => 'required|integer|in:15,30,60,120',
            'password_min_length'        => 'required|integer|min:8|max:24',
            'require_uppercase'          => 'boolean',
            'require_numbers'            => 'boolean',
            'require_special_characters' => 'boolean',
        ]);
        AppSetting::setMany($validated, 'security');
        return redirect()->back()->with('success', 'Security settings saved.');
    }

    public function updateAssets(Request $request)
    {
        $this->authorizePrivileged();
        $validated = $request->validate([
            'allow_custom_categories'        => 'boolean',
            'auto_flag_asset_age_years'      => 'required|integer|min:1|max:15',
            'maintenance_interval_days'      => 'required|integer|min:1',
            'maintenance_reminder_lead_days' => 'required|integer|min:1',
            'maintenance_auto_send'          => 'boolean',
            'qr_code_format'                 => 'required|in:PNG,SVG,PDF',
            'auto_generate_asset_ids'        => 'boolean',
        ]);
        AppSetting::setMany($validated, 'assets');
        return redirect()->back()->with('success', 'Asset settings saved.');
    }

    public function updateSystem(Request $request)
    {
        $this->authorizePrivileged();
        $validated = $request->validate([
            'organization_name'                        => 'required|string|max:255',
            'timezone'                                 => 'required|string|max:100',
            'date_format'                              => 'required|string|max:20',
            'currency'                                 => 'required|string|max:10',
            'language'                                 => 'required|string|max:10',
            'smtp_host'                                => 'nullable|string|max:255',
            'smtp_port'                                => 'nullable|string|max:10',
            'smtp_username'                            => 'nullable|string|max:255',
            'smtp_password'                            => 'nullable|string|max:255',
            'sender_name'                              => 'nullable|string|max:255',
            'sender_email'                             => 'nullable|email|max:255',
            'smtp_tls_enabled'                         => 'boolean',
            'require_executive_approval_for_new_users' => 'boolean',
            'auto_deactivate_inactive_users'           => 'boolean',
            'inactive_days'                            => 'required|integer|min:1',
        ]);
        AppSetting::setMany($validated, 'system');
        return redirect()->back()->with('success', 'System settings saved.');
    }

    public function updateBackup(Request $request)
    {
        $this->authorizePrivileged();
        $validated = $request->validate([
            'auto_backup_enabled'     => 'boolean',
            'backup_frequency'        => 'required|in:daily,weekly,monthly',
            'backup_time'             => 'required|date_format:H:i',
            'retention_days'          => 'required|integer|min:7|max:365',
            'backup_destination'      => 'required|in:local,cloud,ftp',
            'activity_log_retention'  => 'required|string',
            'deleted_asset_retention' => 'required|string',
            'auto_purge_expired_data' => 'boolean',
        ]);
        AppSetting::setMany($validated, 'backup');
        return redirect()->back()->with('success', 'Backup settings saved.');
    }

    private function authorizePrivileged(): void
    {
        $user = auth()->user();
        if (!($user->role === 'admin' || $user->role === 'executive' || $user->is_super_user)) {
            abort(403);
        }
    }
}
