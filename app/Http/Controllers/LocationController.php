<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index()
    {
        if (!$this->supportsLocationHierarchy()) {
            $locations = Location::withCount('assets')->orderBy('name')->get();

            return Inertia::render('Admin/Locations', [
                'locations' => $locations,
            ]);
        }

        return redirect()->route('store-management.index');
    }

    public function store(Request $request)
    {
        if (!$this->supportsLocationHierarchy()) {
            $request->validate([
                'name' => 'required|string|max:255|unique:locations,name',
                'address' => 'nullable|string',
            ]);

            Location::create($request->only(['name', 'address']));
            $this->flushLocationCaches();

            return redirect()->back()->with('success', 'Location created successfully.');
        }

        $request->validate([
            'type' => ['required', Rule::in(['complex', 'store'])],
            'name' => ['required', 'string', 'max:255', Rule::unique('locations')->where(fn ($query) => $query
                ->where('type', $request->type)
                ->where('parent_id', $request->type === 'store' ? $request->parent_id : null))],
            'address' => 'nullable|string',
            'parent_id' => [
                Rule::requiredIf($request->type === 'store'),
                'nullable',
                Rule::exists('locations', 'id')->where(fn ($query) => $query->where('type', 'complex')),
            ],
        ]);

        Location::create([
            'name' => $request->name,
            'address' => $request->address,
            'type' => $request->type,
            'parent_id' => $request->type === 'store' ? $request->parent_id : null,
        ]);
        $this->flushLocationCaches();

        return redirect()->back()->with('success', ucfirst($request->type) . ' created successfully.');
    }

    public function update(Request $request, Location $location)
    {
        if (!$this->supportsLocationHierarchy()) {
            $request->validate([
                'name' => 'required|string|max:255|unique:locations,name,' . $location->id,
                'address' => 'nullable|string',
            ]);

            $location->update($request->only(['name', 'address']));
            $this->flushLocationCaches();

            return redirect()->back()->with('success', 'Location updated successfully.');
        }

        $request->validate([
            'type' => ['required', Rule::in(['complex', 'store'])],
            'name' => ['required', 'string', 'max:255', Rule::unique('locations')->ignore($location->id)->where(fn ($query) => $query
                ->where('type', $request->type)
                ->where('parent_id', $request->type === 'store' ? $request->parent_id : null))],
            'address' => 'nullable|string',
            'parent_id' => [
                Rule::requiredIf($request->type === 'store'),
                'nullable',
                Rule::exists('locations', 'id')->where(fn ($query) => $query->where('type', 'complex')),
            ],
        ]);

        if ($location->id === (int) $request->parent_id) {
            return redirect()->back()->withErrors(['parent_id' => 'A store cannot be assigned to itself.']);
        }

        if ($location->type === 'complex' && $request->type === 'store' && $location->stores()->exists()) {
            return redirect()->back()->withErrors(['type' => 'A complex with child stores cannot be converted into a store.']);
        }

        $location->update([
            'name' => $request->name,
            'address' => $request->address,
            'type' => $request->type,
            'parent_id' => $request->type === 'store' ? $request->parent_id : null,
        ]);
        $this->flushLocationCaches();

        return redirect()->back()->with('success', ucfirst($request->type) . ' updated successfully.');
    }

    public function destroy(Location $location)
    {
        if (!$this->supportsLocationHierarchy()) {
            if ($location->assets()->count() > 0) {
                return redirect()->back()->withErrors(['location' => 'Cannot delete location with assigned assets.']);
            }

            $location->delete();
            $this->flushLocationCaches();

            return redirect()->back()->with('success', 'Location deleted successfully.');
        }

        if ($location->stores()->exists()) {
            return redirect()->back()->withErrors(['location' => 'Cannot delete a complex that still has stores assigned to it.']);
        }

        if ($location->assets()->count() > 0 || $location->assetsAsComplex()->count() > 0 || $location->assetsAsStore()->count() > 0) {
            return redirect()->back()->withErrors(['location' => 'Cannot delete a location that still has assets assigned to it.']);
        }

        $location->delete();
        $this->flushLocationCaches();

        return redirect()->back()->with('success', ucfirst($location->type) . ' deleted successfully.');
    }

    private function flushLocationCaches(): void
    {
        Cache::forget('locations-dropdown');
    }

    private function supportsLocationHierarchy(): bool
    {
        return Schema::hasColumns('locations', ['type', 'parent_id'])
            && Schema::hasColumns('assets', ['complex_id', 'store_id']);
    }
}
