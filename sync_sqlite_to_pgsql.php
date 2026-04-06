<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require __DIR__.'/vendor/autoload.php';

$app = require __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

config([
    'database.connections.sqlite_sync' => [
        'driver' => 'sqlite',
        'database' => database_path('database.sqlite'),
        'prefix' => '',
        'foreign_key_constraints' => true,
    ],
]);

$mode = $argv[1] ?? 'report';
$sourceConnectionName = $argv[2] ?? env('SYNC_SOURCE_CONNECTION', 'sqlite_sync');
$targetConnectionName = $argv[3] ?? env('SYNC_TARGET_CONNECTION', 'pgsql_live');
$tableFilter = array_values(array_filter(array_map(
    static fn (string $value): string => trim($value),
    explode(',', $argv[4] ?? env('SYNC_TABLES', ''))
)));
$options = array_slice($argv, 5);

if (! array_key_exists($sourceConnectionName, config('database.connections'))) {
    fwrite(STDERR, "Unknown source connection [$sourceConnectionName].".PHP_EOL);
    exit(1);
}

if (! array_key_exists($targetConnectionName, config('database.connections'))) {
    fwrite(STDERR, "Unknown target connection [$targetConnectionName].".PHP_EOL);
    exit(1);
}

if ($sourceConnectionName === $targetConnectionName) {
    fwrite(STDERR, "Source and target connections must be different.".PHP_EOL);
    exit(1);
}

$skipTables = [
    'migrations',
    'cache',
    'cache_locks',
    'jobs',
    'job_batches',
    'failed_jobs',
    'sessions',
    'password_reset_tokens',
];

$tablePriority = [
    'departments',
    'categories',
    'locations',
    'users',
    'vendors',
    'tasks',
    'position_specifications',
    'assets',
    'asset_requests',
    'asset_allocations',
    'transfer_requests',
    'maintenance_records',
    'capex_forms',
    'capex_approvals',
    'purchase_orders',
    'goods_receipts',
    'invoices',
    'software_licences',
    'activity_log',
];

$isTruthy = static function (mixed $value): bool {
    if (is_bool($value)) {
        return $value;
    }

    return filter_var($value, FILTER_VALIDATE_BOOLEAN);
};

$forceLiveSync = in_array('--force-live-sync', $options, true)
    || $isTruthy(env('ALLOW_DESTRUCTIVE_SYNC', false));

$targetConfig = config("database.connections.$targetConnectionName", []);
$targetHost = strtolower((string) ($targetConfig['host'] ?? ''));
$looksLikeLiveTarget = preg_match('/(^|_)(live|prod|production)(_|$)/i', $targetConnectionName) === 1;
$isRemoteTarget = $targetHost !== '' && ! in_array($targetHost, ['127.0.0.1', 'localhost', 'postgres'], true);

if ($mode === 'sync' && ($looksLikeLiveTarget || $isRemoteTarget) && ! $forceLiveSync) {
    fwrite(STDERR, "Refusing to sync into live/remote target [$targetConnectionName] without --force-live-sync.".PHP_EOL);
    exit(1);
}

$source = DB::connection($sourceConnectionName);
$target = DB::connection($targetConnectionName);

$getSourceTableNames = static function () use ($source): array {
    return match ($source->getDriverName()) {
        'sqlite' => array_map(
            static fn ($row) => $row->name,
            $source->select("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
        ),
        'pgsql' => array_map(
            static fn ($row) => $row->table_name,
            $source->select(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_type = 'BASE TABLE' ORDER BY table_name",
                ['public']
            )
        ),
        default => throw new RuntimeException('Unsupported source driver: '.$source->getDriverName()),
    };
};

$sourceTables = $getSourceTableNames();

$tables = array_values(array_filter($sourceTables, static fn ($table) => ! in_array($table, $skipTables, true)));

if ($tableFilter !== []) {
    $tables = array_values(array_filter($tables, static fn ($table) => in_array($table, $tableFilter, true)));
}

usort($tables, static function (string $left, string $right) use ($tablePriority): int {
    $leftIndex = array_search($left, $tablePriority, true);
    $rightIndex = array_search($right, $tablePriority, true);

    if ($leftIndex === false && $rightIndex === false) {
        return strcmp($left, $right);
    }

    if ($leftIndex === false) {
        return 1;
    }

    if ($rightIndex === false) {
        return -1;
    }

    return $leftIndex <=> $rightIndex;
});

$getColumns = static function ($connection, string $table): array {
    return $connection->getSchemaBuilder()->getColumnListing($table);
};

$quoteIdentifier = static fn (string $value): string => '"'.str_replace('"', '""', $value).'"';

if ($mode === 'report') {
    $report = [];

    foreach ($tables as $table) {
        $report[$table] = [
            'source_connection' => $sourceConnectionName,
            'source_count' => (int) $source->table($table)->count(),
            'target_connection' => $targetConnectionName,
            'target_table_exists' => ! empty($getColumns($target, $table)),
        ];
    }

    echo json_encode($report, JSON_PRETTY_PRINT).PHP_EOL;
    exit(0);
}

if ($mode !== 'sync') {
    fwrite(STDERR, "Unsupported mode. Use 'report' or 'sync'.".PHP_EOL);
    exit(1);
}

$results = [];
$preparedTables = [];
$deferredUpdates = [];

$target->unprepared('SET session_replication_role = replica;');

try {
    foreach ($tables as $table) {
        $targetColumns = $getColumns($target, $table);

        if ($targetColumns === []) {
            $results[$table] = [
                'status' => 'skipped',
                'reason' => 'missing_in_pgsql',
            ];
            continue;
        }

        $sourceColumns = $getColumns($source, $table);
        $columns = array_values(array_intersect($sourceColumns, $targetColumns));

        if ($columns === []) {
            $results[$table] = [
                'status' => 'skipped',
                'reason' => 'no_shared_columns',
            ];
            continue;
        }

        $rows = array_map(
            static fn ($row) => array_intersect_key((array) $row, array_flip($columns)),
            $source->table($table)->get()->all()
        );

        if ($table === 'departments' && in_array('manager_id', $columns, true)) {
            foreach ($rows as &$row) {
                if (array_key_exists('manager_id', $row) && $row['manager_id'] !== null) {
                    $deferredUpdates[$table][] = [
                        'id' => $row['id'],
                        'manager_id' => $row['manager_id'],
                    ];
                    $row['manager_id'] = null;
                }
            }
            unset($row);
        }

        $preparedTables[$table] = [
            'columns' => $columns,
            'rows' => $rows,
        ];
    }

    foreach (array_reverse(array_keys($preparedTables)) as $table) {
        $target->statement('TRUNCATE TABLE '.$quoteIdentifier($table).' RESTART IDENTITY CASCADE');
    }

    foreach ($tables as $table) {
        if (! array_key_exists($table, $preparedTables)) {
            continue;
        }

        $columns = $preparedTables[$table]['columns'];
        $sourceRows = $preparedTables[$table]['rows'];

        if ($sourceRows !== []) {
            foreach (array_chunk($sourceRows, 200) as $chunk) {
                $target->table($table)->insert($chunk);
            }
        }

        if (in_array('id', $columns, true)) {
            $quotedTable = $quoteIdentifier($table);
            $quotedId = $quoteIdentifier('id');
            $target->statement(
                "SELECT setval(pg_get_serial_sequence('public.$table', 'id'), COALESCE(MAX($quotedId), 1), MAX($quotedId) IS NOT NULL) FROM $quotedTable"
            );
        }

        $results[$table] = [
            'status' => 'copied',
            'rows' => count($sourceRows),
        ];
    }

    foreach ($deferredUpdates as $table => $updates) {
        foreach ($updates as $update) {
            $target->table($table)
                ->where('id', $update['id'])
                ->update(['manager_id' => $update['manager_id']]);
        }
    }
} finally {
    $target->unprepared('SET session_replication_role = DEFAULT;');
}

echo json_encode($results, JSON_PRETTY_PRINT).PHP_EOL;