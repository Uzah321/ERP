<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('capex_forms', function (Blueprint $table) {
            // JSON array of [{user_id, label}] defining the custom approval chain
            $table->json('approval_chain')->nullable()->after('quotations');
            // Which index in the chain is currently awaiting approval (0-based)
            $table->unsignedInteger('current_stage_index')->default(0)->after('approval_chain');
        });
    }

    public function down(): void
    {
        Schema::table('capex_forms', function (Blueprint $table) {
            $table->dropColumn(['approval_chain', 'current_stage_index']);
        });
    }
};
