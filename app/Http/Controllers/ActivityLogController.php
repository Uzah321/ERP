<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $filters = $this->filtersFromRequest($request);
        $query = Activity::query()->with(['causer', 'subject'])->latest('created_at');

        $this->applyFilters($query, $filters);

        $logs = $query
            ->paginate($filters['per_page'])
            ->withQueryString()
            ->through(fn (Activity $log) => $this->transformActivity($log));

        return Inertia::render('ActivityLog/Index', [
            'logs' => $logs,
            'filters' => $filters,
            'stats' => $this->buildStats($filters),
            'filter_options' => [
                'events' => $this->eventOptions(),
                'users' => $this->userOptions(),
            ],
            'last_updated_at' => now()->format('Y-m-d H:i:s'),
        ]);
    }

    public function export(Request $request)
    {
        $filters = $this->filtersFromRequest($request);
        $query = Activity::query()->with(['causer', 'subject'])->latest('created_at');

        $this->applyFilters($query, $filters);

        $fileName = 'activity-log-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'ID',
                'Date',
                'Time Ago',
                'Action',
                'Description',
                'Actor',
                'Actor Email',
                'Subject Type',
                'Subject ID',
                'Subject Name',
                'Changed Fields',
                'Batch UUID',
                'Metadata',
            ]);

            /** @var \Illuminate\Database\Eloquent\Collection<int, Activity> $exportLogs */
            $exportLogs = $query->get();

            foreach ($exportLogs as $log) {
                $activity = $this->transformActivity($log);

                fputcsv($handle, [
                    $activity['id'],
                    $activity['created_at'],
                    $activity['created_at_human'],
                    $activity['event'],
                    $activity['description'],
                    $activity['causer'],
                    $activity['causer_email'],
                    $activity['subject_type'],
                    $activity['subject_id'],
                    $activity['subject_name'],
                    implode(', ', array_map(fn (array $change) => $change['field'], $activity['changes'])),
                    $activity['batch_uuid'] ?? '',
                    json_encode($activity['metadata'], JSON_UNESCAPED_SLASHES),
                ]);
            }

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Return audit trail for a specific asset.
     */
    public function forAsset(Asset $asset)
    {
        $logs = Activity::with('causer')
            ->where('subject_type', Asset::class)
            ->where('subject_id', $asset->id)
            ->latest()
            ->get()
            ->map(fn (Activity $log) => $this->transformActivity($log));

        return Inertia::render('ActivityLog/AssetHistory', [
            'asset' => ['id' => $asset->id, 'name' => $asset->name, 'barcode' => $asset->barcode],
            'logs'  => $logs,
        ]);
    }

    private function filtersFromRequest(Request $request): array
    {
        $perPage = (int) $request->integer('per_page', 15);

        return [
            'search' => trim((string) $request->input('search', '')),
            'event' => trim((string) $request->input('event', '')),
            'user_id' => $request->filled('user_id') ? (int) $request->input('user_id') : null,
            'date_from' => trim((string) $request->input('date_from', '')),
            'date_to' => trim((string) $request->input('date_to', '')),
            'per_page' => in_array($perPage, [15, 25, 50, 100], true) ? $perPage : 15,
        ];
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        if ($filters['search'] !== '') {
            $search = $filters['search'];

            $query->where(function ($activityQuery) use ($search) {
                $activityQuery
                    ->where('description', 'like', "%{$search}%")
                    ->orWhere('event', 'like', "%{$search}%")
                    ->orWhere('subject_type', 'like', "%{$search}%")
                    ->orWhere('log_name', 'like', "%{$search}%")
                    ->orWhereHas('causer', function ($causerQuery) use ($search) {
                        $causerQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });

                if (is_numeric($search)) {
                    $activityQuery->orWhere('subject_id', (int) $search);
                }
            });
        }

        if ($filters['event'] !== '') {
            $query->where('event', $filters['event']);
        }

        if ($filters['user_id']) {
            $query->where('causer_id', $filters['user_id']);
        }

        if ($filters['date_from'] !== '') {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if ($filters['date_to'] !== '') {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }
    }

    private function buildStats(array $filters): array
    {
        $query = Activity::query();
        $this->applyFilters($query, $filters);

        $latestActivityAt = (clone $query)->max('created_at');

        return [
            'total_records' => (clone $query)->count(),
            'today_records' => (clone $query)->whereDate('created_at', today())->count(),
            'unique_users' => (clone $query)->whereNotNull('causer_id')->distinct()->count('causer_id'),
            'system_events' => (clone $query)->whereNull('causer_id')->count(),
            'created_count' => (clone $query)->where('event', 'created')->count(),
            'updated_count' => (clone $query)->where('event', 'updated')->count(),
            'deleted_count' => (clone $query)->where('event', 'deleted')->count(),
            'latest_activity_at' => $latestActivityAt
                ? Carbon::parse($latestActivityAt)->format('Y-m-d H:i:s')
                : null,
        ];
    }

    private function eventOptions(): array
    {
        return Activity::query()
            ->whereNotNull('event')
            ->select('event')
            ->distinct()
            ->orderBy('event')
            ->pluck('event')
            ->filter()
            ->values()
            ->all();
    }

    private function userOptions(): array
    {
        $userIds = Activity::query()
            ->whereNotNull('causer_id')
            ->distinct()
            ->pluck('causer_id');

        return User::query()
            ->whereIn('id', $userIds)
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ])
            ->all();
    }

    private function transformActivity(Activity $log): array
    {
        $properties = $this->normalizeProperties($log->properties);
        $changes = $this->extractChanges($properties);
        $subjectName = $this->resolveSubjectName($log);
        $createdAt = $log->created_at ?? now();

        return [
            'id' => $log->id,
            'description' => $log->description,
            'event' => $log->event,
            'summary' => $this->buildSummary($log, $subjectName),
            'causer' => $log->causer ? $log->causer->name : 'System',
            'causer_email' => $log->causer ? $log->causer->email : '',
            'causer_id' => $log->causer_id,
            'subject_type' => class_basename($log->subject_type),
            'subject_id' => $log->subject_id,
            'subject_name' => $subjectName,
            'created_at' => $createdAt->format('Y-m-d H:i:s'),
            'created_at_human' => $createdAt->diffForHumans(),
            'batch_uuid' => $log->batch_uuid,
            'log_name' => $log->log_name,
            'changes' => $changes,
            'change_count' => count($changes),
            'properties' => $properties,
            'metadata' => [
                'log_name' => $log->log_name,
                'batch_uuid' => $log->batch_uuid,
                'event' => $log->event,
                'subject_type' => class_basename($log->subject_type),
                'subject_id' => $log->subject_id,
            ],
        ];
    }

    private function normalizeProperties($properties): array
    {
        if ($properties instanceof Collection) {
            return $properties->toArray();
        }

        if (is_array($properties)) {
            return $properties;
        }

        if ($properties instanceof \Illuminate\Support\Fluent) {
            return $properties->toArray();
        }

        return (array) $properties;
    }

    private function extractChanges(array $properties): array
    {
        $attributes = data_get($properties, 'attributes', []);
        $old = data_get($properties, 'old', []);
        $fields = array_unique(array_merge(array_keys($attributes), array_keys($old)));
        $changes = [];

        foreach ($fields as $field) {
            $changes[] = [
                'field' => $field,
                'old' => $this->stringifyValue($old[$field] ?? null),
                'new' => $this->stringifyValue($attributes[$field] ?? null),
            ];
        }

        return $changes;
    }

    private function resolveSubjectName(Activity $log): string
    {
        if (!$log->subject) {
            return '-';
        }

        return $log->subject->name
            ?? $log->subject->title
            ?? $log->subject->barcode
            ?? $log->subject->po_number
            ?? $log->subject->vendor_name
            ?? 'Record #' . $log->subject_id;
    }

    private function buildSummary(Activity $log, string $subjectName): string
    {
        $event = $log->event ?: 'activity';
        $subjectType = class_basename($log->subject_type) ?: 'record';

        return ucfirst($event) . ' ' . strtolower($subjectType) . ' ' . $subjectName;
    }

    private function stringifyValue($value): string
    {
        if ($value === null || $value === '') {
            return '—';
        }

        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        if (is_array($value)) {
            return json_encode($value, JSON_UNESCAPED_SLASHES);
        }

        return (string) $value;
    }
}

