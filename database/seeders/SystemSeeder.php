<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Location;

class SystemSeeder extends Seeder
{
    public function run(): void
    {
        $categories = ['Laptops', 'Desktops', 'Vehicles', 'Office Furniture', 'POS Machines', 'Networking Equipment'];
        foreach ($categories as $c) {
            Category::firstOrCreate(['name' => $c]);
        }

        $locations = ['Harare Branch', 'Bulawayo Office', 'Main Warehouse', 'Mutare Depot', 'HQ'];
        foreach ($locations as $l) {
            Location::firstOrCreate(['name' => $l]);
        }
    }
}
