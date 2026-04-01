<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_activity_log_index_supports_advanced_filters(): void
    {
        $viewer = User::factory()->create(['role' => 'admin']);
        $selectedUser = User::factory()->create(['role' => 'admin', 'name' => 'Selected User']);
        $otherUser = User::factory()->create(['role' => 'admin', 'name' => 'Other User']);

        Activity::query()->create([
            'log_name' => 'default',
            'description' => 'Filtered activity entry',
            'event' => 'updated',
            'causer_type' => User::class,
            'causer_id' => $selectedUser->id,
            'properties' => [
                'attributes' => ['status' => 'in_use'],
                'old' => ['status' => 'available'],
            ],
            'created_at' => now()->subHour(),
            'updated_at' => now()->subHour(),
        ]);

        Activity::query()->create([
            'log_name' => 'default',
            'description' => 'Wrong user entry',
            'event' => 'updated',
            'causer_type' => User::class,
            'causer_id' => $otherUser->id,
            'properties' => [],
            'created_at' => now()->subHour(),
            'updated_at' => now()->subHour(),
        ]);

        Activity::query()->create([
            'log_name' => 'default',
            'description' => 'Wrong date entry',
            'event' => 'updated',
            'causer_type' => User::class,
            'causer_id' => $selectedUser->id,
            'properties' => [],
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(3),
        ]);

        Activity::query()->create([
            'log_name' => 'default',
            'description' => 'Wrong event entry',
            'event' => 'deleted',
            'causer_type' => User::class,
            'causer_id' => $selectedUser->id,
            'properties' => [],
            'created_at' => now()->subHour(),
            'updated_at' => now()->subHour(),
        ]);

        $response = $this->actingAs($viewer)->get(route('activity-log.index', [
            'event' => 'updated',
            'user_id' => $selectedUser->id,
            'date_from' => now()->subDay()->toDateString(),
            'date_to' => now()->toDateString(),
            'search' => 'Filtered activity',
        ], absolute: false));

        $response
            ->assertOk()
            ->assertSee('Filtered activity entry')
            ->assertDontSee('Wrong user entry')
            ->assertDontSee('Wrong date entry')
            ->assertDontSee('Wrong event entry');
    }

    public function test_activity_log_export_returns_filtered_csv(): void
    {
        $viewer = User::factory()->create(['role' => 'admin']);
        $selectedUser = User::factory()->create(['role' => 'admin', 'name' => 'Export User']);

        Activity::query()->create([
            'log_name' => 'default',
            'description' => 'CSV included entry',
            'event' => 'created',
            'causer_type' => User::class,
            'causer_id' => $selectedUser->id,
            'properties' => [
                'attributes' => ['name' => 'Laptop'],
            ],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Activity::query()->create([
            'log_name' => 'default',
            'description' => 'CSV excluded entry',
            'event' => 'deleted',
            'causer_type' => User::class,
            'causer_id' => $selectedUser->id,
            'properties' => [],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->actingAs($viewer)->get(route('activity-log.export.csv', [
            'event' => 'created',
            'search' => 'included',
        ], absolute: false));

        $response
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8')
            ->assertSee('CSV included entry')
            ->assertDontSee('CSV excluded entry');
    }
}