<?php require __DIR__.'/vendor/autoload.php'; $app = require_once __DIR__.'/bootstrap/app.php'; $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class); $kernel->bootstrap(); DB::statement('DROP TABLE IF EXISTS maintenance_records CASCADE;');
DB::table('migrations')->where('migration', 'like', '%maintenance_records%')->delete();
