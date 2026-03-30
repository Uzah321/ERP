import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    TableToolbar,
    TableToolbarContent,
    TableToolbarSearch,
    Tag,
    Select,
    SelectItem,
    Pagination,
} from '@carbon/react';

function eventTag(ev) {
    const map = { created: 'green', updated: 'blue', deleted: 'red' };
    return (
        <Tag type={map[ev] ?? 'gray'}>{ev || 'ACTION'}</Tag>
    );
}

export default function ActivityLogIndex({ auth, logs, filters }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [event, setEvent]   = useState(filters?.event ?? '');

    function doFilter(s, ev) {
        setSearch(s);
        setEvent(ev);
        router.get(route('activity-log.index'), { search: s, event: ev }, {
            only: ['logs', 'filters'], preserveState: true, replace: true,
        });
    }

    const rows = logs.data ?? logs;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Asset Activity Log" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-800">Asset Activity Log</h1>
                    <Tag type="blue">{logs.total ?? logs.length} records</Tag>
                </div>

                <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
                    <TableToolbar>
                        <TableToolbarContent>
                            <TableToolbarSearch
                                value={search}
                                onChange={(e) => doFilter(e.target.value, event)}
                                placeholder="Search description or user…"
                                persistent
                            />
                            <Select
                                id="event-filter"
                                labelText=""
                                hideLabel
                                value={event}
                                onChange={(e) => doFilter(search, e.target.value)}
                                className="w-48"
                            >
                                <SelectItem value="" text="All Events" />
                                <SelectItem value="created" text="Created" />
                                <SelectItem value="updated" text="Updated" />
                                <SelectItem value="deleted" text="Deleted" />
                            </Select>
                        </TableToolbarContent>
                    </TableToolbar>

                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Date / Time</TableHeader>
                                <TableHeader>Causer</TableHeader>
                                <TableHeader>Event</TableHeader>
                                <TableHeader>Description</TableHeader>
                                <TableHeader>Target Entity</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                        No activity logs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <span className="font-mono text-xs">{log.created_at}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-gray-900">{log.causer}</div>
                                            {log.causer_email && (
                                                <div className="text-xs text-gray-500">{log.causer_email}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>{eventTag(log.event)}</TableCell>
                                        <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                                        <TableCell>
                                            <div className="text-xs text-gray-500 uppercase font-semibold">
                                                {log.subject_type || '-'}
                                            </div>
                                            <div className="font-medium text-gray-800">{log.subject_name}</div>
                                            {log.subject_type === 'Asset' && log.subject_id && (
                                                <a
                                                    href={route('activity-log.asset', log.subject_id)}
                                                    className="text-xs text-blue-600 hover:underline mt-0.5"
                                                >
                                                    View history &rarr;
                                                </a>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {logs.last_page && logs.last_page > 1 && (
                        <Pagination
                            totalItems={logs.total}
                            pageSize={logs.per_page}
                            page={logs.current_page}
                            pageSizes={[15, 25, 50]}
                            onChange={({ page, pageSize }) => {
                                router.get(route('activity-log.index'), {
                                    search,
                                    event,
                                    page,
                                    per_page: pageSize,
                                }, { preserveState: true, replace: true });
                            }}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
