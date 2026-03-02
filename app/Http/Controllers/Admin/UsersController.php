<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserDetailResource;
use App\Models\User;
use App\Supports\TheOneResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UsersController extends Controller
{
    /**
     * Display all users
     */
    public function index(Request $request)
    {
        if ($request->expectsJson()) {
            return UserResource::collection(User::paginate());
        }

        return Inertia::render('admin/users/index', []);
    }

    /**
     * Display show user
     */
    public function show($id)
    {
        $user = User::with(['onboardingProfile'])
            ->withCount(['campaigns', 'campaignTransactions', 'accountStatements'])
            ->find($id);

        if (!$user) {
            return TheOneResponse::notFound(
                __('Record not found'),
                'admin.users.index'
            );
        }

        return Inertia::render('admin/users/show', [
            'userData' => new UserDetailResource($user),
        ]);
    }
}
