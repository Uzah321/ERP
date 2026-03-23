<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->string('delivery_status')->default('open')->after('authorised_by');
            // open | partial | delivered
            $table->string('invoice_status')->default('pending')->after('delivery_status');
            // pending | invoiced | paid
        });
    }

    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropColumn(['delivery_status', 'invoice_status']);
        });
    }
};
