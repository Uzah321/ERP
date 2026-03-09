<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('assets', function (Blueprint $table) {
            $table->timestamp('last_audited_at')->nullable();
        });
    }
    public function down(): void {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn('last_audited_at');
        });
    }
};
