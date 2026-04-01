<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_standard_user_dashboard_redirects_to_asset_management(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertRedirect(route('asset-management.index', absolute: false));
    }

    public function test_admin_dashboard_redirects_to_admin_summary(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertRedirect(route('admin.dashboard', absolute: false));

        $this->actingAs($user)
            ->get('/admin/dashboard')
            ->assertOk();
    }

    public function test_executive_dashboard_redirects_to_executive_summary(): void
    {
        $user = User::factory()->create(['role' => 'executive']);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertRedirect(route('executive.dashboard', absolute: false));

        $this->actingAs($user)
            ->get('/executive/dashboard')
            ->assertOk();
    }

    public function test_super_user_can_access_admin_and_executive_dashboards(): void
    {
        $user = User::factory()->create([
            'email' => 'd.zondo@simbisa.co.zw',
            'role' => 'user',
            'is_active' => false,
        ]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertRedirect(route('executive.dashboard', absolute: false));

        $this->actingAs($user)
            ->get('/admin/dashboard')
            ->assertOk();

        $this->actingAs($user)
            ->get('/executive/dashboard')
            ->assertOk();
    }

    public function test_settings_page_is_displayed_for_authenticated_users(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get('/settings')
            ->assertOk();
    }

    public function test_procurement_dashboard_is_available_to_admin_and_executive_only(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $executive = User::factory()->create(['role' => 'executive']);
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($admin)
            ->get('/procurement/dashboard')
            ->assertOk();

        $this->actingAs($executive)
            ->get('/procurement/dashboard')
            ->assertOk();

        $this->actingAs($user)
            ->get('/procurement/dashboard')
            ->assertForbidden();
    }

    public function test_user_access_workspace_is_available_to_executives_only(): void
    {
        $executive = User::factory()->create(['role' => 'executive']);
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($executive)
            ->get(route('users.index', absolute: false))
            ->assertOk();

        $this->actingAs($admin)
            ->get(route('users.index', absolute: false))
            ->assertForbidden();

        $this->actingAs($user)
            ->get(route('users.index', absolute: false))
            ->assertForbidden();
    }

    public function test_standard_users_cannot_create_assets_directly(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->post('/assets', [])
            ->assertForbidden();
    }

    public function test_transfers_page_redirects_to_asset_allocations(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get('/transfers')
            ->assertRedirect(route('admin.allocations.index', absolute: false));
    }
}