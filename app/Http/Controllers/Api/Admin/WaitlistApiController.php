<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\WaitlistRegistrationResource;
use App\Models\WaitlistRegistration;
use App\Traits\HasFilterableList;
use Illuminate\Http\Request;

class WaitlistApiController extends Controller
{
    use HasFilterableList;

    /**
     * Display a listing of waitlist registrations
     *
     * Supported query params:
     * - search: string (searches stage_name, contact_email, city_state)
     * - sort_by: string (column to sort by)
     * - sort_direction: asc|desc
     * - per_page: int|all
     * - creation_availability: string (immediate, 1-2_weeks, 1_month, not_sure)
     * - email_sent: sent|pending
     * - terms_accepted: accepted|pending
     * - created_at_from: date
     * - created_at_to: date
     */
    public function index(Request $request)
    {
        return $this->listResource(
            WaitlistRegistration::class,
            WaitlistRegistrationResource::class,
            [
                // Searchable columns
                'searchable' => [
                    'stage_name',
                    'contact_email',
                    'city_state',
                    'instagram_handle',
                    'youtube_handle',
                    'tiktok_handle',
                ],

                // Filterable columns
                'filterable' => [
                    'creation_availability',
                    'email_sent',
                    'terms_accepted',
                ],

                // Sortable columns
                'sortable' => [
                    'id',
                    'stage_name',
                    'contact_email',
                    'creation_availability',
                    'created_at',
                ],

                // Default sorting
                'defaultSort' => 'created_at',
                'defaultDirection' => 'desc',

                // Items per page
                'perPage' => 30,

                // Enable cache (only in production)
                'cache' => !app()->isLocal(),

                // Custom filters
                'customFilters' => function ($query, $request) {
                    // Filter by email sent status
                    if ($request->filled('email_sent')) {
                        if ($request->input('email_sent') === 'sent') {
                            $query->whereNotNull('email_sent_at');
                        } elseif ($request->input('email_sent') === 'pending') {
                            $query->whereNull('email_sent_at');
                        }
                    }

                    // Filter by terms accepted status
                    if ($request->filled('terms_accepted')) {
                        if ($request->input('terms_accepted') === 'accepted') {
                            $query->whereNotNull('terms_accepted_at');
                        } elseif ($request->input('terms_accepted') === 'pending') {
                            $query->whereNull('terms_accepted_at');
                        }
                    }

                    // Filter by artist types (array)
                    if ($request->filled('artist_type')) {
                        $artistType = $request->input('artist_type');
                        $query->whereJsonContains('artist_types', $artistType);
                    }

                    // Filter by participation types (array)
                    if ($request->filled('participation_type')) {
                        $participationType = $request->input('participation_type');
                        $query->whereJsonContains('participation_types', $participationType);
                    }
                },
            ]
        );
    }
}
