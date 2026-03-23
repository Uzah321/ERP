<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('capex_forms', function (Blueprint $table) {
            // Stores array of storage paths for the uploaded vendor quotation files
            $table->json('quotations')->nullable()->after('items');
        });
    }

    public function down(): void
    {
        Schema::table('capex_forms', function (Blueprint $table) {
            $table->dropColumn('quotations');
        });
    }
};
