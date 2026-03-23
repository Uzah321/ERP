<?php

namespace App\Http\Controllers;

use App\Models\PositionSpecification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PositionSpecificationController extends Controller
{
    public function index()
    {
        $specs = PositionSpecification::orderBy('position_name')
            ->orderBy('asset_type')
            ->get();

        return Inertia::render('Admin/PositionSpecifications', [
            'specifications' => $specs,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'position_name' => 'required|string|max:255',
            'asset_type' => 'required|string|max:255',
            'specifications' => 'required|string|max:1000',
        ]);

        PositionSpecification::create($request->only(['position_name', 'asset_type', 'specifications']));

        return redirect()->back()->with('success', 'Position specification created successfully.');
    }

    public function update(Request $request, PositionSpecification $positionSpecification)
    {
        $request->validate([
            'position_name' => 'required|string|max:255',
            'asset_type' => 'required|string|max:255',
            'specifications' => 'required|string|max:1000',
        ]);

        $positionSpecification->update($request->only(['position_name', 'asset_type', 'specifications']));

        return redirect()->back()->with('success', 'Position specification updated successfully.');
    }

    public function destroy(PositionSpecification $positionSpecification)
    {
        $positionSpecification->delete();

        return redirect()->back()->with('success', 'Position specification deleted successfully.');
    }

    /**
     * Return all position specifications as JSON (for the asset request modal).
     */
    public function all()
    {
        return PositionSpecification::all()->groupBy('position_name')->map(function ($group) {
            return $group->pluck('specifications', 'asset_type');
        });
    }
}
