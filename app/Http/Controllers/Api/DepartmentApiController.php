<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;

class DepartmentApiController extends Controller
{
    public function index()
    {
        return response()->json(
            Department::with('manager')->withCount(['users', 'assets'])->orderBy('name')->get()
        );
    }

    public function show(Department $department)
    {
        return response()->json(
            $department->load('manager')->loadCount(['users', 'assets'])
        );
    }
}
