<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Exceptions\Auth\SocialAuthenticationException;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthService
{
	/**
	 * Handle user authentication/registration via Google OAuth.
	 *
	 * @return User
	 * @throws SocialAuthenticationException
	 */
	public function handleCallback(): User
	{
		try {
			$googleUser = $this->getGoogleUser();
			$this->validateGoogleUser($googleUser);

			return DB::transaction(function () use ($googleUser) {
				$user = $this->findOrCreateUser($googleUser);
				$this->loginUser($user);

				return $user;
			});
		} catch (SocialAuthenticationException $e) {
			throw $e;
		} catch (Throwable $e) {
			Log::error('Google authentication error', [
				'message' => $e->getMessage(),
				'trace' => $e->getTraceAsString(),
			]);

			throw new SocialAuthenticationException(
				'Erro ao processar autenticação com Google. Por favor, tente novamente.'
			);
		}
	}

	/**
	 * Get user data from Google.
	 *
	 * @return SocialiteUser
	 * @throws SocialAuthenticationException
	 */
	private function getGoogleUser(): SocialiteUser
	{
		try {
			return Socialite::driver('google')->user();
		} catch (Throwable $e) {
			Log::error('Failed to get Google user', [
				'message' => $e->getMessage(),
			]);

			throw new SocialAuthenticationException(
				'Não foi possível obter dados do Google. Por favor, tente novamente.'
			);
		}
	}

	/**
	 * Validate required Google user data.
	 *
	 * @param SocialiteUser $googleUser
	 * @return void
	 * @throws SocialAuthenticationException
	 */
	private function validateGoogleUser(SocialiteUser $googleUser): void
	{
		if (!$googleUser->getId()) {
			throw new SocialAuthenticationException('ID do Google não encontrado.');
		}

		if (!$googleUser->getEmail()) {
			throw new SocialAuthenticationException('Email não fornecido pelo Google.');
		}

		if (!$googleUser->getName()) {
			throw new SocialAuthenticationException('Nome não fornecido pelo Google.');
		}
	}

	/**
	 * Find existing user or create a new one.
	 *
	 * @param SocialiteUser $googleUser
	 * @return User
	 */
	private function findOrCreateUser(SocialiteUser $googleUser): User
	{
		// Try to find by Google ID first
		$user = User::where('google_id', $googleUser->getId())->first();

		if ($user) {
			return $this->updateUserData($user, $googleUser);
		}

		// Check if user exists with same email
		$user = User::where('email', $googleUser->getEmail())->first();

		if ($user) {
			// Link existing account with Google
			return $this->linkGoogleAccount($user, $googleUser);
		}

		// Create new user
		return $this->createUser($googleUser);
	}

	/**
	 * Update existing user data with Google info.
	 *
	 * @param User $user
	 * @param SocialiteUser $googleUser
	 * @return User
	 */
	private function updateUserData(User $user, SocialiteUser $googleUser): User
	{
		$user->update([
			'name' => $googleUser->getName(),
			'email' => $googleUser->getEmail(),
			'avatar' => $googleUser->getAvatar(),
			'email_verified_at' => $user->email_verified_at ?? now(),
		]);

		return $user;
	}

	/**
	 * Link Google account to existing user.
	 *
	 * @param User $user
	 * @param SocialiteUser $googleUser
	 * @return User
	 */
	private function linkGoogleAccount(User $user, SocialiteUser $googleUser): User
	{
		$user->update([
			'google_id' => $googleUser->getId(),
			'avatar' => $googleUser->getAvatar(),
			'email_verified_at' => $user->email_verified_at ?? now(),
		]);

		Log::info('Google account linked to existing user', [
			'user_id' => $user->id,
			'email' => $user->email,
		]);

		return $user;
	}

	/**
	 * Create a new user from Google data.
	 *
	 * @param SocialiteUser $googleUser
	 * @return User
	 */
	private function createUser(SocialiteUser $googleUser): User
	{
		$user = User::create([
			'name' => $googleUser->getName(),
			'email' => $googleUser->getEmail(),
			'google_id' => $googleUser->getId(),
			'avatar' => $googleUser->getAvatar(),
			'email_verified_at' => now(), // Google emails are already verified
			'password' => null, // No password for OAuth users
		]);

		Log::info('New user created via Google OAuth', [
			'user_id' => $user->id,
			'email' => $user->email,
		]);

		return $user;
	}

	/**
	 * Login the user.
	 *
	 * @param User $user
	 * @return void
	 */
	private function loginUser(User $user): void
	{
		Auth::login($user, remember: true);

		Log::info('User logged in via Google', [
			'user_id' => $user->id,
			'email' => $user->email,
		]);
	}
}

