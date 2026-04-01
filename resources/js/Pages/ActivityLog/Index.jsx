import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Button,
    Pagination,
    Select,
    SelectItem,
    Tag,
    TextInput,
    Tile,
} from '@carbon/react';
import { ArrowUp, Download, Renew } from '@carbon/icons-react';
import { safeRoute } from '@/utils/ziggy';

function eventTag(ev) {
    const map = { created: 'green', updated: 'blue', deleted: 'red' };
    return <Tag type={map[ev] ?? 'gray'}>{ev || 'ACTION'}</Tag>;
}

function buildQuery(params) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
            query.set(key, value);
        }
    });

    return query.toString();
}

function statCards(stats, totalItems) {
    return [
        {
            label: 'Matching Activities',
            value: Number(totalItems ?? stats?.total_records ?? 0).toLocaleString(),
            tone: 'var(--cds-interactive)',
        },
        {
            label: 'Recorded Today',
            value: Number(stats?.today_records ?? 0).toLocaleString(),
            tone: 'var(--cds-support-success)',
        },
        {
            label: 'Active Users',
            value: Number(stats?.unique_users ?? 0).toLocaleString(),
            tone: 'var(--cds-support-warning)',
        },
        {
            label: 'System Events',
            value: Number(stats?.system_events ?? 0).toLocaleString(),
            tone: 'var(--cds-support-error)',
        },
    ];
}

export default function ActivityLogIndex({ auth, logs: logsProp, filters, stats, filter_options, last_updated_at }) {
    const logs = logsProp ?? { data: [], total: 0, per_page: 15 };
    const activityLogIndexHref = safeRoute('activity-log.index') ?? '/activity-log';
    const activityLogExportHref = safeRoute('activity-log.export.csv');
    const [search, setSearch] = useState(filters?.search ?? '');
    const [event, setEvent] = useState(filters?.event ?? '');
    const [userId, setUserId] = useState(filters?.user_id ? String(filters.user_id) : '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters?.date_to ?? '');
    const [showScrollTop, setShowScrollTop] = useState(false);

    const rows = logs.data ?? logs;
    const cards = useMemo(() => statCards(stats, logs.total), [stats, logs.total]);
    const refreshOnly = ['logs', 'filters', 'stats', 'filter_options', 'last_updated_at'];

    useEffect(() => {
        setSearch(filters?.search ?? '');
        setEvent(filters?.event ?? '');
        setUserId(filters?.user_id ? String(filters.user_id) : '');
        setDateFrom(filters?.date_from ?? '');
        setDateTo(filters?.date_to ?? '');
    }, [filters]);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: refreshOnly,
                preserveState: true,
                preserveScroll: true,
            });
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 360);

        window.addEventListener('scroll', onScroll);

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    function currentParams(overrides = {}) {
        return {
            search,
            event,
            user_id: userId,
            date_from: dateFrom,
            date_to: dateTo,
            per_page: logs.per_page ?? filters?.per_page ?? 15,
            ...overrides,
        };
    }

    function applyFilters(overrides = {}) {
        router.get(activityLogIndexHref, currentParams({ page: 1, ...overrides }), {
            only: refreshOnly,
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    function resetFilters() {
        setSearch('');
        setEvent('');
        setUserId('');
        setDateFrom('');
        setDateTo('');

        router.get(activityLogIndexHref, { per_page: logs.per_page ?? 15 }, {
            only: refreshOnly,
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    function exportHref() {
        if (!activityLogExportHref) {
            return '#';
        }

        const query = buildQuery(currentParams());
        const base = activityLogExportHref;

        return query ? `${base}?${query}` : base;
    }

    function refreshNow() {
        router.reload({
            only: refreshOnly,
            preserveState: true,
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Asset Activity Log" />

            <div className="min-h-screen p-6" style={{ background: 'linear-gradient(180deg, #f4f7fb 0%, #ffffff 45%)' }}>
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-semibold" style={{ color: 'var(--cds-text-primary)' }}>Activity Intelligence</h1>
                                <Tag type="blue">{logs.total ?? logs.length} records</Tag>
                            </div>
                            <p className="max-w-3xl text-sm" style={{ color: 'var(--cds-text-secondary)' }}>
                                Monitor user actions, asset changes, and system events in one live timeline with traceable actors, metadata, and field-level change details.
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--cds-text-secondary)' }}>
                                <span>Last sync: {last_updated_at ?? '—'}</span>
                                <span>Latest activity: {stats?.latest_activity_at ?? '—'}</span>
                                <span>Auto-refresh: every 30 seconds</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button kind="ghost" size="sm" renderIcon={Renew} onClick={refreshNow}>Refresh</Button>
                            <Button kind="secondary" size="sm" renderIcon={Download} as="a" href={exportHref()} disabled={!activityLogExportHref}>Export CSV</Button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {cards.map((card) => (
                            <Tile key={card.label} className="border border-slate-200 shadow-sm">
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--cds-text-secondary)' }}>
                                        {card.label}
                                    </p>
                                    <p className="text-3xl font-semibold" style={{ color: card.tone }}>{card.value}</p>
                                </div>
                            </Tile>
                        ))}
                    </div>

                    <Tile className="border border-slate-200 shadow-sm">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="min-w-[16rem] flex-1">
                                <TextInput
                                    id="activity-search"
                                    labelText="Search"
                                    placeholder="Description, user, event or subject"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            applyFilters();
                                        }
                                    }}
                                />
                            </div>

                            <div className="min-w-[12rem] flex-1">
                                <Select id="activity-event" labelText="Action type" value={event} onChange={(e) => setEvent(e.target.value)}>
                                    <SelectItem value="" text="All actions" />
                                    {(filter_options?.events ?? []).map((eventOption) => (
                                        <SelectItem key={eventOption} value={eventOption} text={eventOption} />
                                    ))}
                                </Select>
                            </div>

                            <div className="min-w-[14rem] flex-1">
                                <Select id="activity-user" labelText="User" value={userId} onChange={(e) => setUserId(e.target.value)}>
                                    <SelectItem value="" text="All users" />
                                    {(filter_options?.users ?? []).map((user) => (
                                        <SelectItem key={user.id} value={String(user.id)} text={`${user.name} (${user.email})`} />
                                    ))}
                                </Select>
                            </div>

                            <div className="min-w-[11rem] flex-1">
                                <label className="mb-2 block text-sm" htmlFor="activity-date-from" style={{ color: 'var(--cds-text-secondary)' }}>From date</label>
                                <input
                                    id="activity-date-from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full rounded-none border border-slate-300 bg-white px-3 py-3 text-sm"
                                />
                            </div>

                            <div className="min-w-[11rem] flex-1">
                                <label className="mb-2 block text-sm" htmlFor="activity-date-to" style={{ color: 'var(--cds-text-secondary)' }}>To date</label>
                                <input
                                    id="activity-date-to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full rounded-none border border-slate-300 bg-white px-3 py-3 text-sm"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button kind="primary" size="sm" onClick={() => applyFilters()}>Apply filters</Button>
                                <Button kind="tertiary" size="sm" onClick={resetFilters}>Reset</Button>
                            </div>
                        </div>
                    </Tile>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
                        <div className="space-y-4">
                            {rows.length === 0 ? (
                                <Tile className="border border-dashed border-slate-300 bg-white text-center shadow-sm">
                                    <div className="space-y-2 py-8">
                                        <p className="text-lg font-semibold" style={{ color: 'var(--cds-text-primary)' }}>No activity matches the current filters.</p>
                                        <p className="text-sm" style={{ color: 'var(--cds-text-secondary)' }}>Adjust the action, user, date range, or search term to broaden the timeline.</p>
                                    </div>
                                </Tile>
                            ) : (
                                rows.map((log) => (
                                    <Tile key={log.id} className="border border-slate-200 shadow-sm">
                                        <div className="flex flex-wrap items-start justify-between gap-4 border-l-4 pl-5" style={{ borderColor: 'var(--cds-interactive)' }}>
                                            <div className="min-w-0 flex-1 space-y-4">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    {eventTag(log.event)}
                                                    <Tag type="gray">{log.subject_type || 'Record'}</Tag>
                                                    {log.change_count > 0 && <Tag type="purple">{log.change_count} changes</Tag>}
                                                    {log.batch_uuid && <Tag type="cool-gray">Batch tracked</Tag>}
                                                </div>

                                                <div className="space-y-1">
                                                    <h2 className="text-lg font-semibold" style={{ color: 'var(--cds-text-primary)' }}>{log.summary || log.description}</h2>
                                                    <p className="text-sm" style={{ color: 'var(--cds-text-secondary)' }}>{log.description}</p>
                                                </div>

                                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                                    <div>
                                                        <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--cds-text-secondary)' }}>Actor</p>
                                                        <p className="text-sm font-medium" style={{ color: 'var(--cds-text-primary)' }}>{log.causer}</p>
                                                        {log.causer_email && <p className="text-xs" style={{ color: 'var(--cds-text-secondary)' }}>{log.causer_email}</p>}
                                                    </div>

                                                    <div>
                                                        <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--cds-text-secondary)' }}>Target</p>
                                                        <p className="text-sm font-medium" style={{ color: 'var(--cds-text-primary)' }}>{log.subject_name}</p>
                                                        <p className="text-xs" style={{ color: 'var(--cds-text-secondary)' }}>#{log.subject_id || '—'} • {log.subject_type || 'Unknown'}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--cds-text-secondary)' }}>Timestamp</p>
                                                        <p className="text-sm font-medium" style={{ color: 'var(--cds-text-primary)' }}>{log.created_at}</p>
                                                        <p className="text-xs" style={{ color: 'var(--cds-text-secondary)' }}>{log.created_at_human}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--cds-text-secondary)' }}>Metadata</p>
                                                        <p className="text-sm font-medium" style={{ color: 'var(--cds-text-primary)' }}>{log.log_name || 'default'}</p>
                                                        <p className="text-xs break-all" style={{ color: 'var(--cds-text-secondary)' }}>{log.batch_uuid || 'No batch UUID'}</p>
                                                    </div>
                                                </div>

                                                {log.subject_type === 'Asset' && log.subject_id && (
                                                    <div>
                                                        <Link href={safeRoute('activity-log.asset', log.subject_id) ?? '#'} className="text-sm font-medium" style={{ color: 'var(--cds-link-primary)' }}>
                                                            Open asset history
                                                        </Link>
                                                    </div>
                                                )}

                                                {(log.change_count > 0 || Object.values(log.metadata ?? {}).some(Boolean)) && (
                                                    <details className="rounded border border-slate-200 bg-slate-50 p-4">
                                                        <summary className="cursor-pointer text-sm font-medium" style={{ color: 'var(--cds-link-primary)' }}>
                                                            View detailed metadata
                                                        </summary>

                                                        <div className="mt-4 space-y-4">
                                                            {log.change_count > 0 && (
                                                                <div className="overflow-x-auto">
                                                                    <table className="min-w-full border-collapse text-sm">
                                                                        <thead>
                                                                            <tr className="border-b border-slate-200 text-left">
                                                                                <th className="py-2 pr-4 font-semibold">Field</th>
                                                                                <th className="py-2 pr-4 font-semibold">Previous</th>
                                                                                <th className="py-2 font-semibold">Current</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {log.changes.map((change) => (
                                                                                <tr key={`${log.id}-${change.field}`} className="border-b border-slate-100 align-top">
                                                                                    <td className="py-2 pr-4 font-medium">{change.field}</td>
                                                                                    <td className="py-2 pr-4 break-all" style={{ color: 'var(--cds-text-secondary)' }}>{change.old}</td>
                                                                                    <td className="py-2 break-all" style={{ color: 'var(--cds-text-primary)' }}>{change.new}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}

                                                            <div className="grid gap-3 md:grid-cols-2">
                                                                {Object.entries(log.metadata ?? {}).map(([key, value]) => (
                                                                    <div key={`${log.id}-${key}`} className="rounded border border-slate-200 bg-white p-3">
                                                                        <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--cds-text-secondary)' }}>{key.replaceAll('_', ' ')}</p>
                                                                        <p className="mt-1 text-sm break-all" style={{ color: 'var(--cds-text-primary)' }}>{value || '—'}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </details>
                                                )}
                                            </div>
                                        </div>
                                    </Tile>
                                ))
                            )}

                            {logs.last_page && logs.last_page > 1 && (
                                <Tile className="border border-slate-200 shadow-sm">
                                    <div className="mb-4 text-sm" style={{ color: 'var(--cds-text-secondary)' }}>
                                        Page {logs.current_page} of {logs.last_page}
                                    </div>

                                    <Pagination
                                        totalItems={logs.total}
                                        pageSize={logs.per_page}
                                        page={logs.current_page}
                                        pageSizes={[15, 25, 50, 100]}
                                        onChange={({ page, pageSize }) => {
                                            router.get(activityLogIndexHref, currentParams({ page, per_page: pageSize }), {
                                                only: refreshOnly,
                                                preserveState: true,
                                                preserveScroll: true,
                                                replace: true,
                                            });
                                        }}
                                    />
                                </Tile>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Tile className="border border-slate-200 shadow-sm">
                                <div className="space-y-3">
                                    <h2 className="text-base font-semibold" style={{ color: 'var(--cds-text-primary)' }}>Action Breakdown</h2>
                                    <div className="flex flex-wrap gap-2">
                                        <Tag type="green">Created: {stats?.created_count ?? 0}</Tag>
                                        <Tag type="blue">Updated: {stats?.updated_count ?? 0}</Tag>
                                        <Tag type="red">Deleted: {stats?.deleted_count ?? 0}</Tag>
                                    </div>
                                </div>
                            </Tile>

                            <Tile className="border border-slate-200 shadow-sm">
                                <div className="space-y-3">
                                    <h2 className="text-base font-semibold" style={{ color: 'var(--cds-text-primary)' }}>Current Filter Summary</h2>
                                    <div className="space-y-2 text-sm" style={{ color: 'var(--cds-text-secondary)' }}>
                                        <p>Action: <span style={{ color: 'var(--cds-text-primary)' }}>{event || 'All'}</span></p>
                                        <p>User: <span style={{ color: 'var(--cds-text-primary)' }}>{userId ? filter_options?.users?.find((user) => String(user.id) === userId)?.name ?? 'Selected user' : 'All'}</span></p>
                                        <p>Date range: <span style={{ color: 'var(--cds-text-primary)' }}>{dateFrom || 'Start'} to {dateTo || 'Now'}</span></p>
                                        <p>Search: <span style={{ color: 'var(--cds-text-primary)' }}>{search || 'None'}</span></p>
                                    </div>
                                </div>
                            </Tile>
                        </div>
                    </div>
                </div>

                {showScrollTop && (
                    <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white shadow-lg"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp size={20} />
                    </button>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
