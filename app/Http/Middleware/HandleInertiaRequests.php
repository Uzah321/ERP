<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user?->only([
                    'id', 'name', 'email', 'role', 'department_id',
                    'is_active', 'two_factor_enabled', 'approval_position',
                ]),
                'permissions' => $user ? [
                    'can_manage_assets' => $user->canManageAssets(),
                    'can_manage_administration' => $user->canManageAdministration(),
                    'can_access_procurement' => $user->canAccessProcurement(),
                    'can_view_all_departments' => $user->canViewAllDepartments(),
                    'dashboard_route_name' => $user->dashboardRouteName(),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
