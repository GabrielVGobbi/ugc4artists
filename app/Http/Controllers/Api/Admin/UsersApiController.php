<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Supports\TheOneResponse;
use App\Traits\HasFilterableList;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UsersApiController extends Controller
{
    use HasFilterableList;

    /**
     * Display all users with filters, search, sorting, and pagination
     *
     * Supported query params:
     * - search: string (searches name, email, phone, document)
     * - sort: string (column to sort by)
     * - sort_direction: asc|desc
     * - per_page: int|all
     * - account_type: string|array (artist, brand, company)
     * - email_verified: verified|unverified
     * - onboarding_completed: completed|pending
     * - has_document: boolean
     * - has_phone: boolean
     * - created_at_from: date
     * - created_at_to: date
     * - updated_at_from: date
     * - updated_at_to: date
     */
    public function index(Request $request)
    {
        if ($request->expectsJson()) {
            return $this->listResource(
                User::class,
                UserResource::class,
                [
                    // Searchable columns (supports relation.column syntax)
                    'searchable' => [
                        'name',
                        'email',
                        'phone',
                        'document',
                    ],

                    // Filterable columns (values passed via query params)
                    'filterable' => [
                        'account_type',
                        'email_verified',
                        'onboarding_completed',
                        'has_document',
                        'has_phone',
                    ],

                    // Sortable columns
                    'sortable' => [
                        'id',
                        'name',
                        'email',
                        'created_at',
                        'updated_at',
                    ],

                    // Eager load relationships
                    'with' => [
                        'onboardingProfile',
                    ],

                    // Count relationships
                    'withCount' => [
                        'campaigns',
                    ],

                    // Default sorting
                    'defaultSort' => 'created_at',
                    'defaultDirection' => 'desc',

                    // Items per page
                    'perPage' => 30,

                    // Enable cache (only in production)
                    'cache' => !app()->isLocal(),

                    // Custom filters (optional)
                    'customFilters' => function ($query, $request) {
                        // Example: Filter users with campaigns
                        if ($request->filled('has_campaigns')) {
                            if ($request->boolean('has_campaigns')) {
                                $query->has('campaigns');
                            } else {
                                $query->doesntHave('campaigns');
                            }
                        }

                        // Example: Filter by role from onboarding profile
                        if ($request->filled('role')) {
                            $query->whereHas('onboardingProfile', function ($q) use ($request) {
                                $q->where('role', $request->string('role')->toString());
                            });
                        }
                    },
                ]
            );
        }
    }

    /**
     * Display show user
     */
    public function show($id)
    {
        if (!$user = User::find($id)) {
            return TheOneResponse::notFound(
                __('Record not found'),
                'admin.users.index'
            );
        }

        return TheOneResponse::ok(
            ['userData' => new UserResource($user)],
            'admin/dashboard'
        );
    }
}
