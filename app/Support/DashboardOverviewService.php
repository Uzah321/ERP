<?php

namespace App\Support;

use App\Models\Asset;
use App\Models\Location;
use App\Models\MaintenanceRecord;
use App\Models\TransferRequest;
use App\Models\User;
use Illuminate\Support\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Activitylog\Models\Activity;

class DashboardOverviewService
{
    public function build(): array
    {
        $supportsLocationHierarchy = $this->supportsLocationHierarchy();
        $today = now()->startOfDay();
        $weekStart = now()->startOfWeek();

        $metrics = [
            'total_assets' => Asset::withoutTrashed()->count(),
            'total_value' => (float) Asset::withoutTrashed()->sum('purchase_cost'),
            'total_users' => User::query()->count(),
            'total_complexes' => $supportsLocationHierarchy
                ? Location::query()->hierarchyType('complex')->count()
                : Location::query()->count(),
            'total_stores' => $supportsLocationHierarchy
                ? Location::query()->hierarchyType('store')->count()
                : 0,
            'total_transfers' => TransferRequest::query()->count(),
            'pending_transfers' => TransferRequest::query()->where('status', 'pending')->count(),
            'completed_transfers' => TransferRequest::query()->where('status', 'completed')->count(),
            'total_maintenance' => MaintenanceRecord::query()->count(),
            'open_maintenance' => MaintenanceRecord::query()->where('status', 'in-progress')->count(),
            'new_assets_today' => Asset::withoutTrashed()->where('created_at', '>=', $today)->count(),
            'new_assets_week' => Asset::withoutTrashed()->where('created_at', '>=', $weekStart)->count(),
        ];

        return [
            'metrics' => $metrics,
            'alerts' => $this->alerts($metrics),
            'quick_stats' => $this->quickStats($today, $weekStart),
            'chart_data' => $this->chartData($supportsLocationHierarchy),
            'recent_activity' => $this->recentActivity(),
            'top_complexes' => $this->topComplexes($supportsLocationHierarchy),
            'supports_location_hierarchy' => $supportsLocationHierarchy,
            'last_updated_at' => now()->format('Y-m-d H:i:s'),
        ];
    }

    private function alerts(array $metrics): array
    {
        return collect([
            $metrics['pending_transfers'] > 0 ? [
                'id' => 'pending-transfers',
                'title' => 'Pending transfer approvals',
                'description' => $metrics['pending_transfers'] . ' transfer request(s) are waiting for action.',
                'tone' => 'red',
                'route_name' => 'admin.allocations.index',
                'cta' => 'Review transfers',
            ] : null,
            $metrics['open_maintenance'] > 0 ? [
                'id' => 'open-maintenance',
                'title' => 'Open maintenance work',
                'description' => $metrics['open_maintenance'] . ' maintenance record(s) are still in progress.',
                'tone' => 'yellow',
                'route_name' => 'maintenance.index',
                'cta' => 'Open maintenance',
            ] : null,
            $metrics['new_assets_today'] > 0 ? [
                'id' => 'new-assets',
                'title' => 'New assets recorded today',
                'description' => $metrics['new_assets_today'] . ' new asset(s) were added in the last 24 hours.',
                'tone' => 'green',
                'route_name' => 'asset-management.index',
                'cta' => 'View assets',
            ] : null,
        ])->filter()->values()->all();
    }

    private function quickStats(CarbonInterface $today, CarbonInterface $weekStart): array
    {
        $dailyActivities = Activity::query()->where('created_at', '>=', $today);
        $weeklyActivities = Activity::query()->where('created_at', '>=', $weekStart);

        return [
            'daily' => [
                'assets_added' => Asset::withoutTrashed()->where('created_at', '>=', $today)->count(),
                'transfer_requests' => TransferRequest::query()->where('created_at', '>=', $today)->count(),
                'maintenance_opened' => MaintenanceRecord::query()->where('created_at', '>=', $today)->count(),
                'active_users' => (clone $dailyActivities)->whereNotNull('causer_id')->distinct()->count('causer_id'),
            ],
            'weekly' => [
                'assets_added' => Asset::withoutTrashed()->where('created_at', '>=', $weekStart)->count(),
                'transfer_requests' => TransferRequest::query()->where('created_at', '>=', $weekStart)->count(),
                'transfers_completed' => TransferRequest::query()->where('updated_at', '>=', $weekStart)->where('status', 'completed')->count(),
                'maintenance_completed' => MaintenanceRecord::query()->where('updated_at', '>=', $weekStart)->where('status', 'completed')->count(),
                'active_users' => (clone $weeklyActivities)->whereNotNull('causer_id')->distinct()->count('causer_id'),
            ],
        ];
    }

    private function chartData(bool $supportsLocationHierarchy): array
    {
        $status = Asset::withoutTrashed()
            ->select('status as label', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->orderByDesc('count')
            ->get();

        $condition = Asset::withoutTrashed()
            ->select('condition as label', DB::raw('count(*) as count'))
            ->groupBy('condition')
            ->orderByDesc('count')
            ->get();

        $distribution = $supportsLocationHierarchy
            ? Asset::withoutTrashed()
                ->join('locations as complexes', 'assets.complex_id', '=', 'complexes.id')
                ->select('complexes.name as label', DB::raw('count(assets.id) as count'))
                ->groupBy('complexes.name')
                ->orderByDesc('count')
                ->limit(6)
                ->get()
            : Asset::withoutTrashed()
                ->join('departments', 'assets.department_id', '=', 'departments.id')
                ->select('departments.name as label', DB::raw('count(assets.id) as count'))
                ->groupBy('departments.name')
                ->orderByDesc('count')
                ->limit(6)
                ->get();

        return [
            'status' => $status,
            'condition' => $condition,
            'distribution' => $distribution,
        ];
    }

    private function recentActivity(): array
    {
        return Activity::query()
            ->with(['causer', 'subject'])
            ->latest('created_at')
            ->limit(8)
            ->get()
            ->map(function (Activity $activity) {
                $createdAt = $activity->created_at ?? now();

                return [
                    'id' => $activity->id,
                    'event' => $activity->event,
                    'description' => $activity->description,
                    'causer' => $activity->causer?->name ?? 'System',
                    'subject_type' => class_basename($activity->subject_type),
                    'subject_id' => $activity->subject_id,
                    'subject_name' => $this->subjectName($activity),
                    'created_at' => $createdAt->format('Y-m-d H:i:s'),
                    'created_at_human' => $createdAt->diffForHumans(),
                ];
            })
            ->all();
    }

    private function topComplexes(bool $supportsLocationHierarchy): array
    {
        if (!$supportsLocationHierarchy) {
            return Location::query()
                ->withCount('assets')
                ->orderByDesc('assets_count')
                ->limit(5)
                ->get(['id', 'name', 'address'])
                ->map(fn (Location $location) => [
                    'id' => $location->id,
                    'name' => $location->name,
                    'address' => $location->address,
                    'stores_count' => 0,
                    'assets_count' => $location->assets_count,
                    'route_name' => 'store-management.index',
                ])
                ->all();
        }

        return Location::query()
            ->hierarchyType('complex')
            ->withCount('stores')
            ->withCount(['assetsAsComplex as assets_count'])
            ->orderByDesc('assets_count')
            ->limit(5)
            ->get(['id', 'name', 'address'])
            ->map(fn (Location $complex) => [
                'id' => $complex->id,
                'name' => $complex->name,
                'address' => $complex->address,
                'stores_count' => $complex->stores_count,
                'assets_count' => $complex->assets_count,
                'route_name' => 'store-management.stores',
            ])
            ->all();
    }

    private function subjectName(Activity $activity): string
    {
        if (!$activity->subject) {
            return '-';
        }

        return $activity->subject->name
            ?? $activity->subject->title
            ?? $activity->subject->barcode
            ?? $activity->subject->po_number
            ?? 'Record #' . $activity->subject_id;
    }

    private function supportsLocationHierarchy(): bool
    {
        return Schema::hasColumns('locations', ['type', 'parent_id'])
            && Schema::hasColumns('assets', ['complex_id', 'store_id']);
    }
}