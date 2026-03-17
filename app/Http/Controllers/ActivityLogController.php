<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index()
    {
        $logs = Activity::with(['causer', 'subject'])
            ->latest()
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'description' => $log->description,
                    'event' => $log->event,
                    'causer' => $log->causer ? $log->causer->name : 'System',
                    'causer_email' => $log->causer ? $log->causer->email : '',
                    'subject_type' => class_basename($log->subject_type),
                    'subject_id' => $log->subject_id,
                    'subject_name' => $log->subject ? ($log->subject->name ?? $log->subject->barcode ?? 'Record #' . $log->subject_id) : '-',
                    'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                    'properties' => $log->properties,
                ];
            });

        return Inertia::render('ActivityLog/Index', [
            'logs' => $logs
        ]);
    }
}

