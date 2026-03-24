<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            // Photo attachment
            $table->string('photo_path')->nullable()->after('description');

            // Stored depreciation tracking (25% straight-line per year)
            $table->decimal('current_value', 10, 2)->nullable()->after('purchase_cost');
            $table->timestamp('last_depreciated_at')->nullable()->after('current_value');
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn(['photo_path', 'current_value', 'last_depreciated_at']);
        });
    }
};
