<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            // Depreciation
            $table->string('depreciation_method')->default('straight_line')->after('description');
            // straight_line | reducing_balance
            $table->unsignedSmallInteger('asset_life_years')->nullable()->after('depreciation_method');
            $table->decimal('salvage_value', 10, 2)->nullable()->after('asset_life_years');

            // Warranty
            $table->date('warranty_expiry_date')->nullable()->after('salvage_value');
            $table->string('warranty_provider')->nullable()->after('warranty_expiry_date');
            $table->text('warranty_notes')->nullable()->after('warranty_provider');

            // Procurement link (auto-filled when goods receipt creates the asset)
            $table->foreignId('goods_receipt_id')->nullable()->constrained('goods_receipts')->nullOnDelete()->after('warranty_notes');
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropForeign(['goods_receipt_id']);
            $table->dropColumn([
                'depreciation_method', 'asset_life_years', 'salvage_value',
                'warranty_expiry_date', 'warranty_provider', 'warranty_notes',
                'goods_receipt_id',
            ]);
        });
    }
};
