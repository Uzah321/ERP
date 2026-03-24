<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->unsignedInteger('maintenance_interval_days')->nullable()->after('warranty_notes');
            $table->date('next_maintenance_date')->nullable()->after('maintenance_interval_days');
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn(['maintenance_interval_days', 'next_maintenance_date']);
        });
    }
};
