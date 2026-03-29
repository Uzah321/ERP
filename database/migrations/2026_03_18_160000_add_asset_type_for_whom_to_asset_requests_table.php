<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asset_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('asset_requests', 'asset_type')) {
                $table->string('asset_type')->nullable();
            }
            if (!Schema::hasColumn('asset_requests', 'for_whom')) {
                $table->string('for_whom')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('asset_requests', function (Blueprint $table) {
            $table->dropColumn(['asset_type', 'for_whom']);
        });
    }
};
