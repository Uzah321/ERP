<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Category;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class StoreManagementController extends Controller
{
    public function index(): Response
    {
        if (!$this->supportsLocationHierarchy()) {
            $locations = Location::withCount('assets')->orderBy('name')->get();

            return Inertia::render('Admin/Locations', [
                'locations' => $locations,
            ]);
        }

        $complexes = Location::query()
            ->hierarchyType('complex')
            ->withCount('stores')
            ->withCount('assetsAsComplex')
            ->orderBy('name')
            ->get(['id', 'name', 'address']);

        return Inertia::render('Operations/Complexes', [
            'complexes' => $complexes,
        ]);
    }

    public function stores(Location $complex): Response
    {
        if (!$this->supportsLocationHierarchy()) {
            $locations = Location::withCount('assets')->orderBy('name')->get();

            return Inertia::render('Admin/Locations', [
                'locations' => $locations,
            ]);
        }

        abort_unless($complex->type === 'complex', 404);

        $stores = Location::query()
            ->hierarchyType('store')
            ->where('parent_id', $complex->id)
            ->withCount('assetsAsStore')
            ->orderBy('name')
            ->get(['id', 'name', 'address', 'parent_id']);

        return Inertia::render('Operations/Stores', [
            'complex' => $complex->only(['id', 'name', 'address', 'type']),
            'complexes' => Location::query()->hierarchyType('complex')->orderBy('name')->get(['id', 'name', 'address']),
            'stores' => $stores,
        ]);
    }

    public function assets(Location $store): Response
    {
        if (!$this->supportsLocationHierarchy()) {
            $locations = Location::withCount('assets')->orderBy('name')->get();

            return Inertia::render('Admin/Locations', [
                'locations' => $locations,
            ]);
        }

        abort_unless($store->type === 'store', 404);

        $store->load(['parent:id,name,address,type']);

        $assets = Asset::query()
            ->with([
                'category:id,name',
                'department:id,name',
                'complex:id,name',
                'store:id,name,parent_id',
            ])
            ->where('store_id', $store->id)
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Operations/StoreAssets', [
            'complex' => $store->parent?->only(['id', 'name', 'address', 'type']),
            'store' => $store->only(['id', 'name', 'address', 'parent_id', 'type']),
            'assets' => $assets,
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'complexes' => Location::query()
                ->hierarchyType('complex')
                ->with(['stores:id,name,parent_id'])
                ->orderBy('name')
                ->get(['id', 'name', 'address']),
        ]);
    }

    private function supportsLocationHierarchy(): bool
    {
        return Schema::hasColumns('locations', ['type', 'parent_id'])
            && Schema::hasColumns('assets', ['complex_id', 'store_id']);
    }
}