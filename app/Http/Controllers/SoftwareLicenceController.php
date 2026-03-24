<?php

namespace App\Http\Controllers;

use App\Models\SoftwareLicence;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SoftwareLicenceController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');

        $licences = SoftwareLicence::query()
            ->when($search, fn ($q) =>
                $q->where('software_name', 'like', "%{$search}%")
                  ->orWhere('vendor_name', 'like', "%{$search}%")
            )
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($lic) => [
                'id'             => $lic->id,
                'software_name'  => $lic->software_name,
                'vendor_name'    => $lic->vendor_name,
                'licence_type'   => $lic->licence_type,
                'seat_count'     => $lic->seat_count,
                'seats_used'     => $lic->seats_used,
                'seats_available'=> $lic->seats_available,
                'purchase_date'  => $lic->purchase_date?->format('Y-m-d'),
                'expiry_date'    => $lic->expiry_date?->format('Y-m-d'),
                'purchase_cost'  => $lic->purchase_cost,
                'annual_cost'    => $lic->annual_cost,
                'status'         => $lic->status,
                'expiry_status'  => $lic->expiry_status,
                'notes'          => $lic->notes,
            ]);

        return Inertia::render('Admin/SoftwareLicences', [
            'licences' => $licences,
            'filters'  => ['search' => $search],
            'flash'    => session('flash', []),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'software_name'  => 'required|string|max:200',
            'vendor_name'    => 'nullable|string|max:200',
            'licence_key'    => 'nullable|string|max:500',
            'licence_type'   => 'required|in:perpetual,subscription,per-seat',
            'seat_count'     => 'nullable|integer|min:1',
            'seats_used'     => 'nullable|integer|min:0',
            'purchase_date'  => 'nullable|date',
            'expiry_date'    => 'nullable|date',
            'purchase_cost'  => 'nullable|numeric|min:0',
            'annual_cost'    => 'nullable|numeric|min:0',
            'status'         => 'required|in:active,expired,cancelled',
            'notes'          => 'nullable|string|max:2000',
        ]);

        SoftwareLicence::create($data);

        return redirect()->route('admin.software-licences.index')
            ->with('flash', ['success' => "Licence for {$data['software_name']} added."]);
    }

    public function update(Request $request, SoftwareLicence $softwareLicence)
    {
        $data = $request->validate([
            'software_name'  => 'required|string|max:200',
            'vendor_name'    => 'nullable|string|max:200',
            'licence_key'    => 'nullable|string|max:500',
            'licence_type'   => 'required|in:perpetual,subscription,per-seat',
            'seat_count'     => 'nullable|integer|min:1',
            'seats_used'     => 'nullable|integer|min:0',
            'purchase_date'  => 'nullable|date',
            'expiry_date'    => 'nullable|date',
            'purchase_cost'  => 'nullable|numeric|min:0',
            'annual_cost'    => 'nullable|numeric|min:0',
            'status'         => 'required|in:active,expired,cancelled',
            'notes'          => 'nullable|string|max:2000',
        ]);

        $softwareLicence->update($data);

        return redirect()->route('admin.software-licences.index')
            ->with('flash', ['success' => "Licence for {$data['software_name']} updated."]);
    }

    public function destroy(SoftwareLicence $softwareLicence)
    {
        $name = $softwareLicence->software_name;
        $softwareLicence->delete();

        return redirect()->route('admin.software-licences.index')
            ->with('flash', ['success' => "Licence for {$name} deleted."]);
    }
}
