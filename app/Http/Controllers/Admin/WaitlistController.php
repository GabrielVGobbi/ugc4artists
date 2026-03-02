<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\WaitlistRegistrationResource;
use App\Models\WaitlistRegistration;
use Inertia\Inertia;
use Inertia\Response;

class WaitlistController extends Controller
{
    /**
     * Display a listing of waitlist registrations
     */
    public function index(): Response
    {
        return Inertia::render('admin/waitlist/index', []);
    }

    /**
     * Display a specific waitlist registration
     */
    public function show(int $id): Response
    {
        $registration = WaitlistRegistration::findOrFail($id);

        return Inertia::render('admin/waitlist/show', [
            'registrationData' => new WaitlistRegistrationResource($registration),
        ]);
    }
}
