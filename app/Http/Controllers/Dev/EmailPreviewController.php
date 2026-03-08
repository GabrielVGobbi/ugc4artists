<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dev;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\WelcomeUserNotification;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Preview de emails em ambiente de desenvolvimento.
 * Rotas protegidas: disponíveis apenas fora de produção.
 */
class EmailPreviewController extends Controller
{
    /**
     * Preview do email de boas-vindas (cadastro padrão).
     */
    public function welcomeStandard(): Response
    {
        $user = User::factory()->make([
            'name' => 'Gabriel Artista',
            'email' => 'gabriel@ugc4artists.com.br',
        ]);

        $notification = new WelcomeUserNotification(isGoogleUser: false);
        $mailMessage = $notification->toMail($user);

        return response(
            view($mailMessage->view, $mailMessage->viewData)->render()
        );
    }

    /**
     * Preview do email de boas-vindas (cadastro via Google OAuth).
     */
    public function welcomeGoogle(): Response
    {
        $user = User::factory()->make([
            'name' => 'Maria Cantora',
            'email' => 'maria@ugc4artists.com.br',
        ]);

        $notification = new WelcomeUserNotification(isGoogleUser: true);
        $mailMessage = $notification->toMail($user);

        return response(
            view($mailMessage->view, $mailMessage->viewData)->render()
        );
    }

    /**
     * Enviar email de teste real para um endereço específico.
     */
    public function sendTest(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'name' => ['sometimes', 'string', 'max:100'],
        ]);

        $user = User::factory()->make([
            'name' => $validated['name'] ?? 'Artista Teste',
            'email' => $validated['email'],
        ]);

        $user->notify(new WelcomeUserNotification(isGoogleUser: false));

        return response()->json([
            'message' => "Email de teste enviado para {$validated['email']}",
        ]);
    }
}
