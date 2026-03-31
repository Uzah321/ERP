<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index()
    {
        $users = User::with('department')
            ->orderBy('name')
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'user',
                'is_active' => $user->is_active ?? true,
                'department_name' => $user->department?->name ?? 'Unassigned',
                'department_id' => $user->department_id,
                'approval_position' => $user->approval_position,
                'created_at' => $user->created_at->format('Y-m-d'),
            ]);

        $departments = Department::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => ['required', Rules\Password::defaults()],
            'department_id' => 'required|exists:departments,id',
            'role' => 'required|in:executive,admin,user',
            'approval_position' => 'nullable|in:it_manager,finance_operations,it_head,finance_director',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'department_id' => $request->department_id,
            'role' => $request->role,
            'approval_position' => $request->approval_position ?: null,
        ]);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'department_id' => 'required|exists:departments,id',
            'role' => 'required|in:executive,admin,user',
            'approval_position' => 'nullable|in:it_manager,finance_operations,it_head,finance_director',
        ]);

        $user->update(array_merge(
            $request->only(['name', 'email', 'department_id', 'role']),
            ['approval_position' => $request->approval_position ?: null]
        ));

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function toggleActive(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors(['user' => 'You cannot disable your own account.']);
        }

        $user->update(['is_active' => !$user->is_active]);

        $status = $user->is_active ? 'enabled' : 'disabled';
        return redirect()->back()->with('success', "User {$status} successfully.");
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors(['user' => 'You cannot delete your own account.']);
        }

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }
}
