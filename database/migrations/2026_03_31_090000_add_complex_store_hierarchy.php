<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->string('type')->default('complex')->after('address');
            $table->foreignId('parent_id')->nullable()->after('type')->constrained('locations')->nullOnDelete();
        });

        Schema::table('assets', function (Blueprint $table) {
            $table->foreignId('complex_id')->nullable()->after('location_id')->constrained('locations')->nullOnDelete();
            $table->foreignId('store_id')->nullable()->after('complex_id')->constrained('locations')->nullOnDelete();
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->dropUnique('locations_name_unique');
            $table->unique(['parent_id', 'name', 'type']);
        });

        DB::table('locations')->update([
            'type' => 'complex',
            'parent_id' => null,
        ]);

        $locationIndex = DB::table('locations')
            ->select('id', 'type', 'parent_id')
            ->get()
            ->keyBy('id');

        DB::table('assets')
            ->select('id', 'location_id')
            ->orderBy('id')
            ->chunk(100, function ($assets) use ($locationIndex) {
                foreach ($assets as $asset) {
                    if (!$asset->location_id) {
                        continue;
                    }

                    $location = $locationIndex->get($asset->location_id);
                    if (!$location) {
                        continue;
                    }

                    DB::table('assets')
                        ->where('id', $asset->id)
                        ->update([
                            'complex_id' => $location->type === 'store' ? $location->parent_id : $location->id,
                            'store_id' => $location->type === 'store' ? $location->id : null,
                        ]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropUnique('locations_parent_id_name_type_unique');
            $table->unique('name');
        });

        Schema::table('assets', function (Blueprint $table) {
            $table->dropConstrainedForeignId('store_id');
            $table->dropConstrainedForeignId('complex_id');
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('parent_id');
            $table->dropColumn('type');
        });
    }
};