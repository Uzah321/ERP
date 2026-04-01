<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetRequest;
use App\Models\CapexForm;
use App\Models\Category;
use App\Models\Department;
use App\Models\Invoice;
use App\Models\Location;
use App\Models\MaintenanceRecord;
use App\Models\PurchaseOrder;
use App\Models\TransferRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

class DashboardPayloadTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_returns_rich_overview_payload(): void
    {
        $department = Department::query()->create(['name' => 'IT']);
        $admin = User::factory()->create(['role' => 'admin', 'department_id' => $department->id]);

        $this->seedOverviewData($admin, $department);

        $this->actingAs($admin)
            ->get(route('admin.dashboard', absolute: false))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard')
                ->where('metrics.total_assets', 1)
                ->where('metrics.total_users', 2)
                ->where('metrics.total_complexes', 1)
                ->where('metrics.total_stores', 1)
                ->where('metrics.pending_transfers', 1)
                ->where('metrics.open_maintenance', 1)
                ->where('metrics.new_assets_today', 1)
                ->where('metrics.new_assets_week', 1)
                ->where('supports_location_hierarchy', true)
                ->has('alerts', 3)
                ->has('quick_stats.daily')
                ->has('chart_data.status', 1)
                ->has('recent_activity', 1)
                ->has('top_complexes', 1)
                ->where('top_complexes.0.route_name', 'store-management.stores')
            );
    }

    public function test_executive_dashboard_returns_overview_and_procurement_payloads(): void
    {
        $department = Department::query()->create(['name' => 'Finance']);
        $executive = User::factory()->create(['role' => 'executive', 'department_id' => $department->id]);

        $this->seedOverviewData($executive, $department);
        $this->seedProcurementData($executive, $department);

        $this->actingAs($executive)
            ->get(route('executive.dashboard', absolute: false))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Executive/Dashboard')
                ->where('metrics.total_assets', 1)
                ->where('procurement_metrics.pending_capex', 1)
                ->where('procurement_metrics.approved_waiting_po', 1)
                ->where('procurement_metrics.open_purchase_orders', 1)
                ->where('procurement_metrics.pending_invoices', 1)
                ->where('procurement_metrics.overdue_invoices', 1)
                ->where('procurement_metrics.ytd_spend', 765.0)
                ->has('alerts', 6)
                ->has('recent_purchases', 3)
                ->has('top_complexes', 1)
            );
    }

    public function test_procurement_dashboard_returns_shared_overview_payload(): void
    {
        $department = Department::query()->create(['name' => 'Operations']);
        $admin = User::factory()->create(['role' => 'admin', 'department_id' => $department->id]);

        $this->seedOverviewData($admin, $department);
        $this->seedProcurementData($admin, $department);

        $this->actingAs($admin)
            ->get(route('procurement.dashboard', absolute: false))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Procurement/Dashboard')
                ->where('metrics.total_assets', 1)
                ->where('procurement_metrics.pending_capex', 1)
                ->where('procurement_metrics.approved_waiting_po', 1)
                ->where('procurement_metrics.open_purchase_orders', 1)
                ->where('procurement_metrics.pending_invoices', 1)
                ->where('procurement_metrics.overdue_invoices', 1)
                ->where('procurement_metrics.paid_this_month', 115.0)
                ->has('recent_orders', 3)
                ->has('chart_data.distribution', 1)
                ->has('alerts', 6)
            );
    }

    private function seedOverviewData(User $actor, Department $department): void
    {
        $category = Category::query()->create(['name' => 'Laptop']);
        $complex = Location::query()->create([
            'name' => 'Central Complex ' . $actor->id,
            'address' => 'HQ',
            'type' => 'complex',
        ]);
        $store = Location::query()->create([
            'name' => 'Store ' . $actor->id,
            'address' => 'Ground floor',
            'type' => 'store',
            'parent_id' => $complex->id,
        ]);
        $assignee = User::factory()->create(['role' => 'user', 'department_id' => $department->id]);

        $asset = Asset::query()->create([
            'name' => 'Primary Laptop',
            'serial_number' => 'SER-' . $actor->id,
            'barcode' => 'BAR-' . $actor->id,
            'department_id' => $department->id,
            'category_id' => $category->id,
            'location_id' => $store->id,
            'complex_id' => $complex->id,
            'store_id' => $store->id,
            'assigned_to' => $assignee->id,
            'purchase_cost' => 2400,
            'purchase_date' => now()->toDateString(),
            'condition' => 'Good',
            'status' => 'Active Use',
        ]);

        TransferRequest::query()->create([
            'asset_id' => $asset->id,
            'requested_by' => $actor->id,
            'target_user_id' => $assignee->id,
            'target_location_id' => $store->id,
            'target_department_id' => $department->id,
            'status' => 'pending',
            'reason' => 'Operational move',
        ]);

        MaintenanceRecord::query()->create([
            'asset_id' => $asset->id,
            'user_id' => $actor->id,
            'maintenance_type' => 'Corrective',
            'issue_description' => 'Battery replacement',
            'status' => 'in-progress',
            'start_date' => now()->toDateString(),
        ]);

        Activity::query()->create([
            'log_name' => 'default',
            'description' => 'Asset updated',
            'event' => 'updated',
            'subject_type' => Asset::class,
            'subject_id' => $asset->id,
            'causer_type' => User::class,
            'causer_id' => $actor->id,
            'properties' => ['attributes' => ['status' => 'Active Use']],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function seedProcurementData(User $actor, Department $department): void
    {
        $pendingRequest = $this->createAssetRequest($actor, $department, 'Laptop');
        $waitingRequest = $this->createAssetRequest($actor, $department, 'Printer');
        $openRequest = $this->createAssetRequest($actor, $department, 'Router');
        $deliveredRequest = $this->createAssetRequest($actor, $department, 'Scanner');
        $paidRequest = $this->createAssetRequest($actor, $department, 'Tablet');

        CapexForm::query()->create([
            'asset_request_id' => $pendingRequest->id,
            'rtp_reference' => 'RTP-PENDING-' . $actor->id,
            'request_type' => 'Refresh',
            'asset_life' => '4 Years',
            'cost_allocation' => 'IT',
            'insurance_status' => true,
            'reason_for_purchase' => 'Pending approval test',
            'items' => [['description' => 'Laptop', 'qty' => 1, 'unit_price' => 200]],
            'status' => 'pending_it_manager',
            'total_amount' => 200,
        ]);

        CapexForm::query()->create([
            'asset_request_id' => $waitingRequest->id,
            'rtp_reference' => 'RTP-WAITING-' . $actor->id,
            'request_type' => 'Refresh',
            'asset_life' => '4 Years',
            'cost_allocation' => 'Ops',
            'insurance_status' => true,
            'reason_for_purchase' => 'Approved awaiting PO',
            'items' => [['description' => 'Printer', 'qty' => 1, 'unit_price' => 150]],
            'status' => 'approved',
            'total_amount' => 150,
        ]);

        $openCapex = CapexForm::query()->create([
            'asset_request_id' => $openRequest->id,
            'rtp_reference' => 'RTP-OPEN-' . $actor->id,
            'request_type' => 'Expansion',
            'asset_life' => '4 Years',
            'cost_allocation' => 'Ops',
            'insurance_status' => true,
            'reason_for_purchase' => 'Open PO',
            'items' => [['description' => 'Router', 'qty' => 1, 'unit_price' => 250]],
            'status' => 'approved',
            'total_amount' => 250,
        ]);

        $deliveredCapex = CapexForm::query()->create([
            'asset_request_id' => $deliveredRequest->id,
            'rtp_reference' => 'RTP-DELIVERED-' . $actor->id,
            'request_type' => 'Expansion',
            'asset_life' => '4 Years',
            'cost_allocation' => 'Ops',
            'insurance_status' => true,
            'reason_for_purchase' => 'Delivered PO',
            'items' => [['description' => 'Scanner', 'qty' => 1, 'unit_price' => 400]],
            'status' => 'approved',
            'total_amount' => 400,
        ]);

        $paidCapex = CapexForm::query()->create([
            'asset_request_id' => $paidRequest->id,
            'rtp_reference' => 'RTP-PAID-' . $actor->id,
            'request_type' => 'Expansion',
            'asset_life' => '4 Years',
            'cost_allocation' => 'Ops',
            'insurance_status' => true,
            'reason_for_purchase' => 'Paid invoice',
            'items' => [['description' => 'Tablet', 'qty' => 1, 'unit_price' => 115]],
            'status' => 'approved',
            'total_amount' => 115,
        ]);

        PurchaseOrder::query()->create([
            'po_number' => 1001 + $actor->id,
            'capex_form_id' => $openCapex->id,
            'vendor_name' => 'Open Vendor',
            'items' => [['description' => 'Router', 'qty' => 1, 'unit_price' => 250]],
            'vat_amount' => 0,
            'total_amount' => 250,
            'delivery_status' => 'open',
            'invoice_status' => 'pending',
        ]);

        $deliveredPo = PurchaseOrder::query()->create([
            'po_number' => 2001 + $actor->id,
            'capex_form_id' => $deliveredCapex->id,
            'vendor_name' => 'Delivered Vendor',
            'items' => [['description' => 'Scanner', 'qty' => 1, 'unit_price' => 400]],
            'vat_amount' => 0,
            'total_amount' => 400,
            'delivery_status' => 'delivered',
            'invoice_status' => 'pending',
        ]);

        $paidPo = PurchaseOrder::query()->create([
            'po_number' => 3001 + $actor->id,
            'capex_form_id' => $paidCapex->id,
            'vendor_name' => 'Paid Vendor',
            'items' => [['description' => 'Tablet', 'qty' => 1, 'unit_price' => 115]],
            'vat_amount' => 15,
            'total_amount' => 115,
            'delivery_status' => 'delivered',
            'invoice_status' => 'paid',
        ]);

        Invoice::query()->create([
            'purchase_order_id' => $deliveredPo->id,
            'invoice_number' => 'INV-DUE-' . $actor->id,
            'invoice_date' => now()->subDays(4)->toDateString(),
            'due_date' => now()->subDay()->toDateString(),
            'amount' => 400,
            'vat_amount' => 0,
            'status' => 'pending',
            'po_total_amount' => 400,
        ]);

        Invoice::query()->create([
            'purchase_order_id' => $paidPo->id,
            'invoice_number' => 'INV-PAID-' . $actor->id,
            'invoice_date' => now()->subDays(2)->toDateString(),
            'due_date' => now()->addDays(7)->toDateString(),
            'amount' => 100,
            'vat_amount' => 15,
            'status' => 'paid',
            'paid_at' => now()->toDateString(),
            'payment_method' => 'EFT',
            'po_total_amount' => 115,
        ]);
    }

    private function createAssetRequest(User $actor, Department $department, string $assetType): AssetRequest
    {
        return AssetRequest::query()->create([
            'user_id' => $actor->id,
            'department_id' => $department->id,
            'target_department_id' => $department->id,
            'asset_category' => 'IT Equipment',
            'asset_type' => $assetType,
            'for_whom' => $actor->name,
            'requirements' => $assetType . ' requirements',
            'items' => [['asset_type' => $assetType, 'quantity' => 1, 'requirements' => $assetType . ' requirements']],
            'status' => 'approved',
        ]);
    }
}