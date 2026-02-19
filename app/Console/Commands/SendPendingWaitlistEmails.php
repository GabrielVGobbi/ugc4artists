<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Mail\NewWaitlistRegistrationMail;
use App\Models\WaitlistRegistration;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendPendingWaitlistEmails extends Command
{
	protected $signature = 'waitlist:send-pending-emails';

	protected $description = 'Envia e-mails de notificação para registros da waitlist que ainda não foram notificados';

	public function handle(): int
	{
		$notificationEmail = config('mail.waitlist_notification_email');

		if (! $notificationEmail) {
			$this->error('WAITLIST_NOTIFICATION_EMAIL não está configurado.');

			return self::FAILURE;
		}

		$pending = WaitlistRegistration::whereNull('email_sent_at')->get();

		if ($pending->isEmpty()) {
			$this->info('Nenhum registro pendente de envio.');

			return self::SUCCESS;
		}

		$this->info("Encontrados {$pending->count()} registro(s) pendente(s).");

		$sent = 0;

		foreach ($pending as $registration) {
			try {
				Mail::to($notificationEmail)->send(new NewWaitlistRegistrationMail($registration));

				$registration->update(['email_sent_at' => now()]);

				$sent++;
				$this->line("  ✔ {$registration->stage_name} (#{$registration->id})");
			} catch (\Throwable $e) {
				$this->error("  ✘ {$registration->stage_name} (#{$registration->id}): {$e->getMessage()}");
			}
		}

		$this->info("Envio concluído: {$sent}/{$pending->count()} e-mail(s) enviado(s).");

		return self::SUCCESS;
	}
}
