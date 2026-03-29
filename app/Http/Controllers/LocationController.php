<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index()
    {
        $locations = Location::withCount('assets')->orderBy('name')->get();
        return Inertia::render('Admin/Locations', [
            'locations' => $locations,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:locations,name',
            'address' => 'nullable|string'
        ]);

        Location::create($request->only(['name', 'address']));
        Cache::forget('locations-dropdown');

        return redirect()->back()->with('success', 'Location created successfully.');
    }

    public function update(Request $request, Location $location)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:locations,name,' . $location->id,
            'address' => 'nullable|string'
        ]);

        $location->update($request->only(['name', 'address']));
        Cache::forget('locations-dropdown');

        return redirect()->back()->with('success', 'Location updated successfully.');
    }

    public function destroy(Location $location)
    {
        if ($location->assets()->count() > 0) {
            return redirect()->back()->withErrors(['location' => 'Cannot delete location with assigned assets.']);
        }

        $location->delete();
        Cache::forget('locations-dropdown');

        return redirect()->back()->with('success', 'Location deleted successfully.');
    }
}
