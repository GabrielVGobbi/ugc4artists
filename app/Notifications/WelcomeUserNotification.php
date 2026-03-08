<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeUserNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly bool $isGoogleUser = false
    ) {}

    public function via(User $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(User $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Bem-vindo(a) à UGC Para Artistas! 🎵')
            ->view('emails.welcome-user', [
                'user' => $notifiable,
                'isGoogleUser' => $this->isGoogleUser,
                'dashboardUrl' => route('app.dashboard'),
                'loginUrl' => route('login'),
            ]);
    }

    public function toArray(User $notifiable): array
    {
        return [
            'type' => 'welcome',
            'user_id' => $notifiable->id,
        ];
    }
}
