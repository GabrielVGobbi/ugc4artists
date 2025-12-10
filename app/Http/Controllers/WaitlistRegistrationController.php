<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\WaitlistRegistrationRequest;
use App\Models\WaitlistRegistration;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Controla o fluxo de inscrição da lista de espera UGC 4ARTISTS.
 */
class WaitlistRegistrationController extends Controller
{
    public function index()
    {
        return Inertia::render('landing-page/waitlist/index')->rootView('landing');
    }

    /**
     * Persiste uma nova inscrição na lista de espera.
     */
    public function store(WaitlistRegistrationRequest $request): RedirectResponse
    {
        $data = $request->validated();

        WaitlistRegistration::create([
            'stage_name' => $data['stage_name'],
            'instagram_handle' => $data['instagram_handle'] ?? null,
            'youtube_handle' => $data['youtube_handle'] ?? null,
            'tiktok_handle' => $data['tiktok_handle'] ?? null,
            'contact_email' => $data['contact_email'],
            'artist_types' => $data['artist_types'],
            'other_artist_type' => $data['other_artist_type'] ?? null,
            'main_genre' => $data['main_genre'] ?? null,
            'participation_types' => $data['participation_types'],
            'portfolio_link' => $data['portfolio_link'] ?? null,
            'city_state' => $data['city_state'] ?? null,
            'creation_availability' => $data['creation_availability'],
            'terms_accepted_at' => now(),
        ]);

        return back()->with('success', 'Inscrição recebida com sucesso. Em breve entraremos em contato.');
    }

    /**
     * Disponibiliza o regulamento oficial para download.
     */
    public function regulation(): BinaryFileResponse
    {
        $path = storage_path('docs/Formulário_UGC_4ARTISTS.docx');

        abort_unless(file_exists($path), 404);

        return response()->download(
            $path,
            'Regulamento-Oficial-UGC-4ARTISTS.docx'
        );
    }
}
