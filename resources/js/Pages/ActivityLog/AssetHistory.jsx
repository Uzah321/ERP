import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AssetHistory({ auth, asset, logs }) {
    const eventBadge = (ev) => {
        const map = { created: 'bg-green-100 text-green-700', updated: 'bg-blue-100 text-blue-700', deleted: 'bg-red-100 text-red-700' };
        return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[ev] ?? 'bg-gray-100 text-gray-700'}`}>{ev || 'ACTION'}</span>;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`History — ${asset.name}`} />

            <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('activity-log.index')} className="text-gray-400 hover:text-gray-600 text-sm">← Back to Activity Log</Link>
                </div>

                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Audit History — {asset.name}</h1>
                        <p className="text-sm text-gray-500 font-mono">{asset.barcode}</p>
                    </div>
                </div>

                {logs.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No activity recorded for this asset.</p>
                ) : (
                    <div className="relative pl-6">
                        {/* Vertical timeline line */}
                        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200" />

                        <ol className="space-y-6">
                            {logs.map((log) => (
                                <li key={log.id} className="relative">
                                    <div className="absolute -left-4 top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />
                                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                {eventBadge(log.event)}
                                                <span className="text-sm font-medium text-gray-800">{log.description}</span>
                                            </div>
                                            <span className="text-xs text-gray-400 font-mono">{log.created_at}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            By <span className="font-medium text-gray-700">{log.causer}</span>
                                            {log.causer_email && <span className="ml-1">({log.causer_email})</span>}
                                        </div>
                                        {log.properties && Object.keys(log.properties).length > 0 && (
                                            <details className="mt-2">
                                                <summary className="text-xs text-blue-600 cursor-pointer hover:underline">View changes</summary>
                                                <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2 font-mono whitespace-pre-wrap overflow-auto max-h-40">
                                                    {JSON.stringify(log.properties, null, 2)}
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
