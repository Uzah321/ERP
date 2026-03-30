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

$source = DB::connection('sqlite_sync');
$target = DB::connection('pgsql');

$sourceTables = array_map(
    static fn ($row) => $row->name,
    $source->select("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
);

$tables = array_values(array_filter($sourceTables, static fn ($table) => ! in_array($table, $skipTables, true)));

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

$getSourceColumns = static function (string $table) use ($source): array {
    return array_map(
        static fn ($row) => $row->name,
        $source->select("PRAGMA table_info('$table')")
    );
};

$getTargetColumns = static function (string $table) use ($target): array {
    return array_map(
        static fn ($row) => $row->column_name,
        $target->select(
            'SELECT column_name FROM information_schema.columns WHERE table_schema = ? AND table_name = ? ORDER BY ordinal_position',
            ['public', $table]
        )
    );
};

$quoteIdentifier = static fn (string $value): string => '"'.str_replace('"', '""', $value).'"';

if ($mode === 'report') {
    $report = [];

    foreach ($tables as $table) {
        $report[$table] = [
            'sqlite_count' => (int) $source->table($table)->count(),
            'pgsql_table_exists' => ! empty($getTargetColumns($table)),
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

$target->unprepared('SET session_replication_role = replica;');

try {
    foreach ($tables as $table) {
        $targetColumns = $getTargetColumns($table);

        if ($targetColumns === []) {
            $results[$table] = [
                'status' => 'skipped',
                'reason' => 'missing_in_pgsql',
            ];
            continue;
        }

        $sourceColumns = $getSourceColumns($table);
        $columns = array_values(array_intersect($sourceColumns, $targetColumns));

        if ($columns === []) {
            $results[$table] = [
                'status' => 'skipped',
                'reason' => 'no_shared_columns',
            ];
            continue;
        }

        $sourceRows = array_map(
            static fn ($row) => array_intersect_key((array) $row, array_flip($columns)),
            $source->table($table)->get()->all()
        );

        $target->statement('TRUNCATE TABLE '.$quoteIdentifier($table).' RESTART IDENTITY CASCADE');

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
} finally {
    $target->unprepared('SET session_replication_role = DEFAULT;');
}

echo json_encode($results, JSON_PRETTY_PRINT).PHP_EOL;