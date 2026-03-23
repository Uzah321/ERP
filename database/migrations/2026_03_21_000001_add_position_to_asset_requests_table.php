<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asset_requests', function (Blueprint $table) {
            $table->string('position')->nullable()->after('for_whom');
        });
    }

    public function down(): void
    {
        Schema::table('asset_requests', function (Blueprint $table) {
            $table->dropColumn('position');
        });
    }
};
