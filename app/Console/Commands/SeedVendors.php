<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Vendor;

class SeedVendors extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seed:vendors';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed vendors from provided list';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $vendors = [
            ['name' => 'Adaptive Technology Solut', 'product_category' => 'POS Hardware', 'business_unit' => 'Information Technology', 'owner' => 'SBL Supplier Compliance', 'contact_email' => 'taurai@adaptive-sols.com'],
            ['name' => 'Airsense', 'product_category' => 'IT Hardware', 'business_unit' => 'Information Technology', 'owner' => 'SBL Supplier Compliance', 'contact_email' => 'sales@aia.co.zw'],
            ['name' => 'Appliance Experts', 'product_category' => 'IT Hardware', 'business_unit' => 'Information Technology', 'owner' => 'SBL Supplier Compliance', 'contact_email' => 'gweruapplianceexpert.co.zw'],
            ['name' => 'Atera', 'product_category' => 'Atera RMM', 'business_unit' => 'Information Technology', 'owner' => 'SBL Supplier Compliance', 'contact_email' => 'meira@atera.com'],
            ['name' => 'Auto Alarming', 'product_category' => 'IT Hardware', 'business_unit' => 'Information Technology', 'owner' => 'SBL Supplier Compliance', 'contact_email' => 'autoalarming@gmail.com'],
            ['name' => 'Axis Solutions', 'product_category' => 'Fiscalization Solution', 'business_unit' => 'Information Technology', 'owner' => 'SBL Supplier Compliance', 'contact_email' => 'gngwena@axissol.com'],
            ['name' => 'Canlink', 'product_category' => 'Network Hardware', 'business_unit' => 'Information Technology', 'owner' => 'SBL Supplier Compliance', 'contact_email' => 'mavis@canlink.co.zw'],
            ['name' => 'Comp U Plus', 'product_category' => 'IT Hardware', 'business_unit' => 'Information Technology', 'owner' => 'SBL Supplier Compliance', 'contact_email' => 'deepa@compuplus.co.zw'],
            ['name' => 'Copy Masters', 'product_category' => 'IT Hardware', 'business_unit' => 'Information Technology', 'owner' => 'SBL Supplier Compliance', 'contact_email' => 'alexious1@yahoo.com'],
            ['name' => 'Cybacor', 'product_category' => 'CCTV Hardware', 'business_unit' => 'Information Technology', 'owner' => 'SBL Supplier Compliance', 'contact_email' => 'admin@cybacor.co.zw'],
            ['name' => 'Data Drive', 'product_category' => 'Printers', 'business_unit' => 'Information Technology', 'owner' => 'SBL Supplier Compliance', 'contact_email' => 'copymastertec2020@gmail.com'],
            ['name' => 'First Pack', 'product_category' => 'IT Hardware', 'business_unit' => 'Information Technology', 'owner' => 'SBL Supplier Compliance', 'contact_email' => 'enquiries@firstpack.co.zw'],
            ['name' => 'Fuser Technologies', 'product_category' => 'Laptops', 'business_unit' => 'Information Technology', 'owner' => 'SBL Supplier Compliance', 'contact_email' => 'sales@fusertech.co.zw'],
            ['name' => 'Kenac', 'product_category' => 'Laptops', 'business_unit' => 'Information Technology', 'owner' => 'SBL Supplier Compliance', 'contact_email' => 'sales@kenac.co.zw'],
            ['name' => 'Network Hardware', 'product_category' => 'Network Hardware', 'business_unit' => 'Information Technology', 'owner' => 'SBL Supplier Compliance', 'contact_email' => 'sales@nemstech.co.zw'],
            ['name' => 'Ovacoda Business Solution', 'product_category' => 'POS Hardware', 'business_unit' => 'Information Technology', 'owner' => 'SBL Supplier Compliance', 'contact_email' => 'sales@ovacoda.co.zw'],
            ['name' => 'Safeguard Alarms', 'product_category' => 'Alarm Systems', 'business_unit' => 'Finance Corporate', 'owner' => 'Happymore Makovere', 'contact_email' => 'debtors3.alarms@safeguard.co.zw']
        ];

        Vendor::truncate();
        foreach ($vendors as $v) {
            Vendor::create($v);
        }

        $this->info('Vendors seeded.');
    }
}
