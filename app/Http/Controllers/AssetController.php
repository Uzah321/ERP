<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Category;
use App\Models\Department;
use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AssetController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $department = $user->department;
        
        // Fetch arrays for our dropdowns
        $categories = Category::all();
        $locations = Location::all();
        
        // Fetch assets with their relations
        $assets = Asset::with(['category', 'location'])
            ->where('department_id', $user->department_id)
            ->latest()
            ->get();

        return Inertia::render('Dashboard', [
            'assets' => $assets,
            'all_departments' => Department::all(),
            'department' => $department,
            'categories' => $categories,
            'locations' => $locations
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'serial_number' => 'nullable|string|max:255|unique:assets,serial_number',
            'category_id' => 'required|exists:categories,id',
            'location_id' => 'required|exists:locations,id',
            'purchase_cost' => 'nullable|numeric',
            'purchase_date' => 'nullable|date',
            'condition' => 'required|string',
            'status' => 'required|string',
            'description' => 'nullable|string',
        ]);

        // Automatically Generate a Barcode: SB (Simbisa Brands) + Year + Random 5-digit number
        $barcode = 'SB-' . date('Y') . '-' . strtoupper(substr(uniqid(), -5));

        Asset::create([
            'name' => $request->name,
            'serial_number' => $request->serial_number,
            'barcode' => $barcode, // Generated barcode
            'category_id' => $request->category_id,
            'location_id' => $request->location_id,
            'purchase_cost' => $request->purchase_cost,
            'purchase_date' => $request->purchase_date,
            'condition' => $request->condition,
            'status' => $request->status,
            'description' => $request->description,
            'department_id' => Auth::user()->department_id,
        ]);

        return redirect()->route('dashboard');
    }
}

