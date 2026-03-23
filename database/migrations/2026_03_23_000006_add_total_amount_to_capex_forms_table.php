<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('capex_forms', function (Blueprint $table) {
            // Total amount of the recommended (cheapest) quotation
            $table->decimal('total_amount', 12, 2)->nullable()->after('current_stage_index');
        });
    }

    public function down(): void
    {
        Schema::table('capex_forms', function (Blueprint $table) {
            $table->dropColumn('total_amount');
        });
    }
};
