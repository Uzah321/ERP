<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorController extends Controller
{
    public function index()
    {
        $vendors = Vendor::orderBy('name')->get();

        return Inertia::render('Admin/Vendors', [
            'vendors' => $vendors,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'product_category' => 'required|string|max:255',
            'business_unit' => 'nullable|string|max:255',
            'owner' => 'nullable|string|max:255',
            'contact_email' => 'required|email|max:255',
        ]);

        Vendor::create($request->only([
            'name', 'product_category', 'business_unit', 'owner', 'contact_email'
        ]));

        return redirect()->back()->with('success', 'Vendor created successfully.');
    }

    public function update(Request $request, Vendor $vendor)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'product_category' => 'required|string|max:255',
            'business_unit' => 'nullable|string|max:255',
            'owner' => 'nullable|string|max:255',
            'contact_email' => 'required|email|max:255',
        ]);

        $vendor->update($request->only([
            'name', 'product_category', 'business_unit', 'owner', 'contact_email'
        ]));

        return redirect()->back()->with('success', 'Vendor updated successfully.');
    }

    public function destroy(Vendor $vendor)
    {
        $vendor->delete();

        return redirect()->back()->with('success', 'Vendor deleted successfully.');
    }
}
