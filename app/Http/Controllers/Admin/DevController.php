<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Supports\TheOneResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DevController extends Controller
{
    /**
     * Display all users
     */
    public function index(Request $request, $component = null)
    {
        return Inertia::render("admin/dev/components/$component", []);
    }
}
