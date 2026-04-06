<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require __DIR__.'/vendor/autoload.php';

$app = require __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$connectionName = $argv[1] ?? env('SYNC_SOURCE_CONNECTION', 'pgsql');
$outputPath = $argv[2] ?? null;

if ($outputPath === null) {
    fwrite(STDERR, "Usage: php export_connection_backup.php <connection> <output-path>".PHP_EOL);
    exit(1);
}

if (! array_key_exists($connectionName, config('database.connections'))) {
    fwrite(STDERR, "Unknown connection [$connectionName].".PHP_EOL);
    exit(1);
}

$connection = DB::connection($connectionName);
$driver = $connection->getDriverName();

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
    'disposals',
    'app_settings',
];

$quoteIdentifier = static fn (string $value): string => '"'.str_replace('"', '""', $value).'"';
$quoteValue = static function (mixed $value) use ($connection): string {
    if ($value === null) {
        return 'NULL';
    }

    if (is_bool($value)) {
        return $value ? 'TRUE' : 'FALSE';
    }

    if (is_int($value) || is_float($value)) {
        return (string) $value;
    }

    return $connection->getPdo()->quote((string) $value);
};

$tables = match ($driver) {
    'pgsql' => array_map(
        static fn ($row) => $row->table_name,
        $connection->select(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_type = 'BASE TABLE' ORDER BY table_name",
            ['public']
        )
    ),
    'sqlite' => array_map(
        static fn ($row) => $row->name,
        $connection->select("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    ),
    default => throw new RuntimeException('Unsupported driver: '.$driver),
};

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

$sql = [];
$sql[] = '-- AssetLinq data backup';
$sql[] = '-- Connection: '.$connectionName;
$sql[] = '-- Generated at: '.date('c');
$sql[] = 'BEGIN;';
$sql[] = 'SET session_replication_role = replica;';

$counts = [];

foreach (array_reverse($tables) as $table) {
    $sql[] = 'TRUNCATE TABLE '.$quoteIdentifier($table).' RESTART IDENTITY CASCADE;';
}

foreach ($tables as $table) {
    $rows = $connection->table($table)->get()->map(static fn ($row) => (array) $row)->all();
    $counts[$table] = count($rows);

    if ($rows === []) {
        continue;
    }

    $columns = array_keys($rows[0]);
    $quotedColumns = implode(', ', array_map($quoteIdentifier, $columns));

    foreach ($rows as $row) {
        $values = implode(', ', array_map($quoteValue, array_values($row)));
        $sql[] = 'INSERT INTO '.$quoteIdentifier($table).' ('.$quotedColumns.') VALUES ('.$values.');';
    }

    if (in_array('id', $columns, true)) {
        $sql[] = "SELECT setval(pg_get_serial_sequence('public.$table', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM ".$quoteIdentifier($table).';';
    }
}

$sql[] = 'SET session_replication_role = DEFAULT;';
$sql[] = 'COMMIT;';

$outputDirectory = dirname($outputPath);
if (! is_dir($outputDirectory) && ! mkdir($outputDirectory, 0777, true) && ! is_dir($outputDirectory)) {
    fwrite(STDERR, "Failed to create output directory [$outputDirectory].".PHP_EOL);
    exit(1);
}

file_put_contents($outputPath, implode(PHP_EOL, $sql).PHP_EOL);

echo json_encode([
    'connection' => $connectionName,
    'output_path' => realpath($outputPath) ?: $outputPath,
    'table_counts' => $counts,
], JSON_PRETTY_PRINT).PHP_EOL;