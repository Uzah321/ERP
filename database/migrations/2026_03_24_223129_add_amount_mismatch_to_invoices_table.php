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
        Schema::table('invoices', function (Blueprint $table) {
            $table->boolean('amount_mismatch')->default(false)->after('status');
            $table->decimal('po_total_amount', 12, 2)->nullable()->after('amount_mismatch');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['amount_mismatch', 'po_total_amount']);
        });
    }
};
