<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->string('vendor_email')->nullable()->after('vendor_name');
            $table->string('payment_person_email')->nullable()->after('vendor_email');
            $table->string('payment_person_name')->nullable()->after('payment_person_email');
        });
    }

    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropColumn(['vendor_email', 'payment_person_email', 'payment_person_name']);
        });
    }
};
