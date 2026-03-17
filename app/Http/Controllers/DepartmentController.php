<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::with('manager')
            ->withCount(['users', 'assets'])
            ->orderBy('name')
            ->get();

        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Departments', [
            'departments' => $departments,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
            'manager_id' => 'nullable|exists:users,id',
        ]);

        Department::create($request->only(['name', 'manager_id']));

        return redirect()->back()->with('success', 'Department created successfully.');
    }

    public function update(Request $request, Department $department)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,' . $department->id,
            'manager_id' => 'nullable|exists:users,id',
        ]);

        $department->update($request->only(['name', 'manager_id']));

        return redirect()->back()->with('success', 'Department updated successfully.');
    }

    public function destroy(Department $department)
    {
        if ($department->users()->count() > 0 || $department->assets()->count() > 0) {
            return redirect()->back()->withErrors(['department' => 'Cannot delete department with users or assets assigned.']);
        }

        $department->delete();

        return redirect()->back()->with('success', 'Department deleted successfully.');
    }
}
