<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $event  = $request->input('event', '');

        $query = Activity::with(['causer', 'subject'])->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhereHas('causer', fn ($cq) => $cq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($event) {
            $query->where('event', $event);
        }

        $logs = $query->paginate(50)->through(function ($log) {
            return [
                'id'           => $log->id,
                'description'  => $log->description,
                'event'        => $log->event,
                'causer'       => $log->causer ? $log->causer->name : 'System',
                'causer_email' => $log->causer ? $log->causer->email : '',
                'subject_type' => class_basename($log->subject_type),
                'subject_id'   => $log->subject_id,
                'subject_name' => $log->subject
                    ? ($log->subject->name ?? $log->subject->barcode ?? 'Record #' . $log->subject_id)
                    : '-',
                'created_at'   => $log->created_at->format('Y-m-d H:i:s'),
                'properties'   => $log->properties,
            ];
        });

        return Inertia::render('ActivityLog/Index', [
            'logs'    => $logs,
            'filters' => ['search' => $search, 'event' => $event],
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
            ->map(fn ($log) => [
                'id'           => $log->id,
                'description'  => $log->description,
                'event'        => $log->event,
                'causer'       => $log->causer ? $log->causer->name : 'System',
                'causer_email' => $log->causer ? $log->causer->email : '',
                'created_at'   => $log->created_at->format('Y-m-d H:i:s'),
                'properties'   => $log->properties,
            ]);

        return Inertia::render('ActivityLog/AssetHistory', [
            'asset' => ['id' => $asset->id, 'name' => $asset->name, 'barcode' => $asset->barcode],
            'logs'  => $logs,
        ]);
    }
}

