<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Asset;
use App\Models\Category;
use App\Models\Department;
use App\Models\Location;
use Illuminate\Support\Facades\Schema;

class SystemSeeder extends Seeder
{
    public function run(): void
    {
        $categories = ['Laptops', 'Desktops', 'Vehicles', 'Office Furniture', 'POS Machines', 'Networking Equipment'];
        foreach ($categories as $c) {
            Category::firstOrCreate(['name' => $c]);
        }

        if (!Schema::hasColumns('locations', ['type', 'parent_id']) || !Schema::hasColumns('assets', ['complex_id', 'store_id'])) {
            $locations = ['Harare Branch', 'Bulawayo Office', 'Main Warehouse', 'Mutare Depot', 'HQ'];
            foreach ($locations as $l) {
                Location::firstOrCreate(['name' => $l]);
            }

            return;
        }

        $complexes = [
            [
                'name' => 'Joina City Complex',
                'address' => 'Corner Jason Moyo Ave and Julius Nyerere Way, Harare',
                'stores' => [
                    ['name' => 'Chicken Inn Joina', 'address' => 'Ground floor front counter'],
                    ['name' => 'Pizza Inn Joina', 'address' => 'Food court bay 2'],
                    ['name' => 'Creamy Inn Joina', 'address' => 'Dessert kiosk near escalators'],
                ],
            ],
        ];

        foreach ($complexes as $complexData) {
            $complex = Location::updateOrCreate(
                ['name' => $complexData['name'], 'type' => 'complex', 'parent_id' => null],
                ['address' => $complexData['address']]
            );

            foreach ($complexData['stores'] as $storeData) {
                Location::updateOrCreate(
                    ['name' => $storeData['name'], 'type' => 'store', 'parent_id' => $complex->id],
                    ['address' => $storeData['address']]
                );
            }
        }

        $operationsDepartment = Department::where('name', 'Operations')->first() ?? Department::first();
        $laptopCategory = Category::where('name', 'Laptops')->first();
        $posCategory = Category::where('name', 'POS Machines')->first();
        $furnitureCategory = Category::where('name', 'Office Furniture')->first();

        if (!$operationsDepartment || !$laptopCategory || !$posCategory || !$furnitureCategory) {
            return;
        }

        $joinaComplex = Location::where('name', 'Joina City Complex')->where('type', 'complex')->first();

        if (!$joinaComplex) {
            return;
        }

        $sampleAssets = [
            [
                'name' => 'Front Counter POS',
                'barcode' => 'AL-SEED-POS-001',
                'serial_number' => 'POS-JOINA-001',
                'category_id' => $posCategory->id,
                'store_name' => 'Chicken Inn Joina',
                'condition' => 'Good',
                'status' => 'Active Use',
                'purchase_cost' => 1800,
                'purchase_date' => now()->subMonths(6)->toDateString(),
                'description' => 'Primary point of sale terminal for front counter operations.',
            ],
            [
                'name' => 'Back Office Laptop',
                'barcode' => 'AL-SEED-LTP-001',
                'serial_number' => 'LTP-JOINA-001',
                'category_id' => $laptopCategory->id,
                'store_name' => 'Pizza Inn Joina',
                'condition' => 'New',
                'status' => 'Purchased',
                'purchase_cost' => 1450,
                'purchase_date' => now()->subMonths(2)->toDateString(),
                'description' => 'Store admin laptop for daily reconciliations and reporting.',
            ],
            [
                'name' => 'Manager Desk Set',
                'barcode' => 'AL-SEED-FUR-001',
                'serial_number' => 'FUR-JOINA-001',
                'category_id' => $furnitureCategory->id,
                'store_name' => null,
                'condition' => 'Good',
                'status' => 'Available',
                'purchase_cost' => 620,
                'purchase_date' => now()->subYear()->toDateString(),
                'description' => 'Shared management desk assigned at complex level.',
            ],
        ];

        foreach ($sampleAssets as $assetData) {
            $store = $assetData['store_name']
                ? Location::where('name', $assetData['store_name'])->where('type', 'store')->where('parent_id', $joinaComplex->id)->first()
                : null;

            Asset::updateOrCreate(
                ['barcode' => $assetData['barcode']],
                [
                    'name' => $assetData['name'],
                    'serial_number' => $assetData['serial_number'],
                    'department_id' => $operationsDepartment->id,
                    'category_id' => $assetData['category_id'],
                    'location_id' => $store?->id ?? $joinaComplex->id,
                    'complex_id' => $joinaComplex->id,
                    'store_id' => $store?->id,
                    'purchase_cost' => $assetData['purchase_cost'],
                    'current_value' => $assetData['purchase_cost'],
                    'purchase_date' => $assetData['purchase_date'],
                    'condition' => $assetData['condition'],
                    'status' => $assetData['status'],
                    'description' => $assetData['description'],
                    'depreciation_method' => 'straight_line',
                    'annual_depreciation_rate' => 25,
                ]
            );
        }
    }
}
