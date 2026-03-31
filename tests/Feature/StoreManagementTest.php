<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\Category;
use App\Models\Department;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_view_assets_for_a_selected_store(): void
    {
        $department = Department::create(['name' => 'Operations']);
        $category = Category::create(['name' => 'POS']);
        $complex = Location::create(['name' => 'Bulawayo Complex', 'type' => 'complex']);
        $store = Location::create(['name' => 'Shop 1', 'type' => 'store', 'parent_id' => $complex->id]);
        $user = User::factory()->create(['role' => 'user', 'department_id' => $department->id]);

        Asset::create([
            'name' => 'POS Terminal',
            'barcode' => 'AL-TEST-001',
            'department_id' => $department->id,
            'category_id' => $category->id,
            'location_id' => $store->id,
            'complex_id' => $complex->id,
            'store_id' => $store->id,
            'condition' => 'Good',
            'status' => 'Active',
        ]);

        $this->actingAs($user)
            ->get(route('store-management.assets', ['store' => $store->id], false))
            ->assertOk()
            ->assertSee('POS Terminal')
            ->assertSee('Shop 1')
            ->assertSee('Bulawayo Complex');
    }

    public function test_store_management_lists_stores_on_a_dedicated_complex_page(): void
    {
        $complex = Location::create(['name' => 'Bulawayo Complex', 'type' => 'complex']);
        $store = Location::create(['name' => 'Shop 1', 'type' => 'store', 'parent_id' => $complex->id]);
        $department = Department::create(['name' => 'Operations']);
        $user = User::factory()->create(['role' => 'user', 'department_id' => $department->id]);

        $this->actingAs($user)
            ->get(route('store-management.stores', ['complex' => $complex->id], false))
            ->assertOk()
            ->assertSee('Bulawayo Complex')
            ->assertSee('Shop 1');
    }

    public function test_store_management_lists_complexes_on_a_dedicated_page(): void
    {
        $department = Department::create(['name' => 'Operations']);
        $complex = Location::create(['name' => 'Bulawayo Complex', 'type' => 'complex']);
        $user = User::factory()->create(['role' => 'user', 'department_id' => $department->id]);

        $this->actingAs($user)
            ->get(route('store-management.index', absolute: false))
            ->assertOk()
            ->assertSee($complex->name)
            ->assertDontSee('Select a store to view its assets.');
    }

    public function test_admin_can_register_assets_directly_to_a_complex_and_store(): void
    {
        $department = Department::create(['name' => 'IT']);
        $category = Category::create(['name' => 'Laptops']);
        $complex = Location::create(['name' => 'Harare Complex', 'type' => 'complex']);
        $store = Location::create(['name' => 'Front Desk Store', 'type' => 'store', 'parent_id' => $complex->id]);
        $admin = User::factory()->create(['role' => 'admin', 'department_id' => $department->id]);

        $this->actingAs($admin)
            ->post(route('assets.store', absolute: false), [
                'name' => 'Reception Laptop',
                'serial_number' => 'SN-12345',
                'category_id' => $category->id,
                'complex_id' => $complex->id,
                'store_id' => $store->id,
                'condition' => 'New',
                'status' => 'Purchased',
            ])
            ->assertRedirect(route('asset-management.index', absolute: false));

        $this->assertDatabaseHas('assets', [
            'name' => 'Reception Laptop',
            'complex_id' => $complex->id,
            'store_id' => $store->id,
            'location_id' => $store->id,
            'department_id' => $department->id,
        ]);
    }

    public function test_asset_register_can_filter_by_complex_and_store(): void
    {
        $department = Department::create(['name' => 'Retail Operations']);
        $category = Category::create(['name' => 'Store Equipment']);
        $complexA = Location::create(['name' => 'Complex A', 'type' => 'complex']);
        $complexB = Location::create(['name' => 'Complex B', 'type' => 'complex']);
        $storeA = Location::create(['name' => 'Store A1', 'type' => 'store', 'parent_id' => $complexA->id]);
        $storeB = Location::create(['name' => 'Store B1', 'type' => 'store', 'parent_id' => $complexB->id]);
        $admin = User::factory()->create(['role' => 'admin', 'department_id' => $department->id]);

        Asset::create([
            'name' => 'Till A',
            'barcode' => 'AL-FILTER-001',
            'department_id' => $department->id,
            'category_id' => $category->id,
            'location_id' => $storeA->id,
            'complex_id' => $complexA->id,
            'store_id' => $storeA->id,
            'condition' => 'Good',
            'status' => 'Active',
        ]);

        Asset::create([
            'name' => 'Till B',
            'barcode' => 'AL-FILTER-002',
            'department_id' => $department->id,
            'category_id' => $category->id,
            'location_id' => $storeB->id,
            'complex_id' => $complexB->id,
            'store_id' => $storeB->id,
            'condition' => 'Good',
            'status' => 'Active',
        ]);

        $this->actingAs($admin)
            ->get(route('asset-management.index', ['complex_id' => $complexA->id, 'store_id' => $storeA->id], false))
            ->assertOk()
            ->assertSee('Till A')
            ->assertDontSee('Till B');
    }
}