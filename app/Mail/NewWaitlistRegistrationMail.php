<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\WaitlistRegistration;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewWaitlistRegistrationMail extends Mailable implements ShouldQueue
{
	use Queueable;
	use SerializesModels;

	public function __construct(public WaitlistRegistration $registration) {}

	public function envelope(): Envelope
	{
		return new Envelope(
			subject: 'Novo cadastro na Waitlist - ' . $this->registration->stage_name,
		);
	}

	public function content(): Content
	{
		return new Content(
			view: 'emails.new-waitlist-registration',
		);
	}
}
