<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->decimal('annual_depreciation_rate', 5, 2)
                ->nullable()
                ->comment('Optional dynamic annual depreciation rate in percentage (e.g. 25.00 for 25%)')
                ->after('depreciation_method');
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn('annual_depreciation_rate');
        });
    }
};
