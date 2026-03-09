<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            'HR', 
            'ACCOUNTS', 
            'OPERATIONS', 
            'IT', 
            'WAREHOUSE', 
            'STATS',
            'AUDIT',        // Added new department
            'MARKETING',    // Added new department
            'PROCUREMENT',  // Usually buys the assets
            'LEGAL',        // Contracts/compliance
            'MANAGEMENT'    // Directors/Executives
        ];

        foreach ($departments as $department) {
            \App\Models\Department::create(['name' => $department]);
        }
    }
}
