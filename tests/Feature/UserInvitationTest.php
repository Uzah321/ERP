<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class UserInvitationTest extends TestCase
{
    use RefreshDatabase;

    public function test_executive_can_invite_user_and_assign_role(): void
    {
        Notification::fake();

        $department = Department::query()->create(['name' => 'Operations']);
        $executive = User::factory()->create(['role' => 'executive', 'department_id' => $department->id]);

        $response = $this->actingAs($executive)->post(route('users.store', absolute: false), [
            'name' => 'Invited Admin',
            'email' => 'invited-admin@example.com',
            'department_id' => $department->id,
            'role' => 'admin',
            'approval_position' => 'it_manager',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $user = User::query()->where('email', 'invited-admin@example.com')->first();

        $this->assertNotNull($user);
        $this->assertSame('admin', $user->role);
        $this->assertSame('it_manager', $user->approval_position);

        Notification::assertSentTo($user, ResetPassword::class);
    }
}