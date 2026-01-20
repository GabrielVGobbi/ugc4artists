<?php

declare(strict_types=1);

namespace App\Exceptions\Auth;

use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SocialAuthenticationException extends Exception
{
	/**
	 * Render the exception into an HTTP response.
	 */
	public function render(Request $request): RedirectResponse
	{
		return redirect()
			->route('google.auth')
			->with('error', $this->message ?? 'Erro ao autenticar com Google. Por favor, tente novamente.');
	}
}
