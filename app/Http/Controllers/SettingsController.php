<?php

namespace App\Http\Controllers;

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
        $user = $request->user();
        $smtpConfig = config('mail.mailers.smtp', []);
        $firstName = Str::of($user->name ?? '')->before(' ')->value();
        $lastName = Str::of($user->name ?? '')->after(' ')->whenEmpty(fn () => '')->value();

        return Inertia::render('Settings/Index', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'roleSummary' => [
                'role' => $user->role,
                'approval_position' => $user->approval_position,
                'two_factor_enabled' => $user->two_factor_enabled,
                'department_name' => $user->department?->name ?? 'Unassigned',
            ],
            'settingsDefaults' => [
                'profile' => [
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $user->email,
                    'phone' => $user->phone ?? '',
                    'department' => $user->department?->name ?? 'Unassigned',
                    'job_title' => $user->approval_position ? Str::of($user->approval_position)->replace('_', ' ')->title()->value() : Str::headline($user->role),
                    'profile_picture_label' => 'Profile picture upload is staged for a later backend pass.',
                ],
                'security' => [
                    'session_timeout' => 30,
                    'password_min_length' => 12,
                    'require_uppercase' => true,
                    'require_numbers' => true,
                    'require_special_characters' => true,
                ],
                'assets' => [
                    'categories' => Category::query()->orderBy('name')->pluck('name')->values()->all(),
                    'allow_custom_categories' => true,
                    'auto_flag_asset_age_years' => 5,
                    'maintenance_interval_days' => 180,
                    'maintenance_reminder_lead_days' => 14,
                    'maintenance_auto_send' => true,
                    'qr_code_format' => 'PNG',
                    'auto_generate_asset_ids' => true,
                ],
                'system' => [
                    'organization_name' => config('app.name', 'ASSETLINQ'),
                    'timezone' => config('app.timezone', 'UTC'),
                    'date_format' => 'Y-m-d',
                    'currency' => 'USD',
                    'language' => config('app.locale', 'en'),
                    'smtp_host' => $smtpConfig['host'] ?? '',
                    'smtp_port' => (string) ($smtpConfig['port'] ?? ''),
                    'smtp_username' => $smtpConfig['username'] ?? '',
                    'smtp_password' => $smtpConfig['password'] ?? '',
                    'sender_name' => config('mail.from.name', config('app.name', 'ASSETLINQ')),
                    'sender_email' => config('mail.from.address', ''),
                    'smtp_tls_enabled' => in_array($smtpConfig['encryption'] ?? null, ['tls', 'ssl'], true),
                    'require_executive_approval_for_new_users' => true,
                    'auto_deactivate_inactive_users' => true,
                    'inactive_days' => 90,
                ],
                'backup' => [
                    'auto_backup_enabled' => false,
                    'backup_frequency' => 'weekly',
                    'backup_time' => '02:00',
                    'retention_days' => 30,
                    'backup_destination' => 'local',
                    'activity_log_retention' => '365 days',
                    'deleted_asset_retention' => '90 days',
                    'auto_purge_expired_data' => false,
                ],
            ],
        ]);
    }
}