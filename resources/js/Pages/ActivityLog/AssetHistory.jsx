import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Tag } from '@carbon/react';

function eventTag(ev) {
    const map = { created: 'green', updated: 'blue', deleted: 'red' };
    return <Tag type={map[ev] ?? 'gray'}>{ev || 'ACTION'}</Tag>;
}

export default function AssetHistory({ auth, asset, logs }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`History — ${asset.name}`} />

            <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('activity-log.index')} className="text-sm" style={{ color: 'var(--cds-text-placeholder)' }}>
                        &larr; Back to Activity Log
                    </Link>
                </div>

                <div>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--cds-text-primary)' }}>Audit History &mdash; {asset.name}</h1>
                    <p className="text-sm" style={{ color: 'var(--cds-text-secondary)' }}>{asset.barcode}</p>
                </div>

                {logs.length === 0 ? (
                    <p className="text-sm italic" style={{ color: 'var(--cds-text-placeholder)' }}>No activity recorded for this asset.</p>
                ) : (
                    <div className="relative pl-6">
                        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200" />
                        <ol className="space-y-6">
                            {logs.map((log) => (
                                <li key={log.id} className="relative">
                                    <div className="absolute -left-4 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow" style={{ background: 'var(--cds-interactive)' }} />
                                    <div className="bg-white border border-gray-200 p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                {eventTag(log.event)}
                                                <span className="text-sm font-medium" style={{ color: 'var(--cds-text-primary)' }}>
                                                    {log.description}
                                                </span>
                                            </div>
                                            <span className="text-xs" style={{ color: 'var(--cds-text-placeholder)' }}>{log.created_at}</span>
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--cds-text-secondary)' }}>
                                            By <span className="font-medium" style={{ color: 'var(--cds-text-primary)' }}>{log.causer}</span>
                                            {log.causer_email && (
                                                <span className="ml-1">({log.causer_email})</span>
                                            )}
                                        </div>
                                        {log.properties && Object.keys(log.properties).length > 0 && (
                                            <details className="mt-2">
                                                <summary className="text-xs cursor-pointer hover:underline" style={{ color: 'var(--cds-link-primary)' }}>
                                                    View changes
                                                </summary>
                                                <div className="mt-2 text-xs p-2 whitespace-pre-wrap overflow-auto max-h-40" style={{ color: 'var(--cds-text-secondary)', background: 'var(--cds-layer-01)' }}>
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
