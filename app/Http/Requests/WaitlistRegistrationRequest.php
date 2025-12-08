<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

/**
 * Request responsável por validar a inscrição da lista de espera.
 */
class WaitlistRegistrationRequest extends FormRequest
{
	public const ARTIST_TYPES = [
		'singer',
		'instrumentalist',
		'content_creator',
		'other',
	];

	public const PARTICIPATION_TYPES = [
		'paid_campaign',
		'music_launch',
	];

	public const AVAILABILITY_OPTIONS = [
		'high',
		'medium',
		'low',
	];

	/**
	 * Garante que qualquer visitante possa enviar a inscrição.
	 */
	public function authorize(): bool
	{
		return true;
	}

	/**
	 * Define as regras de validação para cada campo do formulário.
	 *
	 * @return array<string, mixed>
	 */
	public function rules(): array
	{
		return [
			'stage_name' => ['required', 'string', 'max:180'],
			'instagram_handle' => [
				'required_without_all:youtube_handle,tiktok_handle',
				'nullable',
				'string',
				'max:120',
			],
			'youtube_handle' => ['nullable', 'string', 'max:120'],
			'tiktok_handle' => ['nullable', 'string', 'max:120'],
			'contact_email' => ['required', 'email', 'max:180'],
			'artist_types' => [
				'required',
				'array',
				'min:1',
			],
			'artist_types.*' => [
				'string',
				Rule::in(self::ARTIST_TYPES),
			],
			'other_artist_type' => [
				'nullable',
				'string',
				'max:160',
				Rule::requiredIf(fn () => $this->hasArtistType('other')),
			],
			'main_genre' => ['nullable', 'string', 'max:160'],
			'participation_types' => [
				'required',
				'array',
				'min:1',
			],
			'participation_types.*' => [
				'string',
				Rule::in(self::PARTICIPATION_TYPES),
			],
			'portfolio_link' => ['nullable', 'url', 'max:255'],
			'city_state' => ['nullable', 'string', 'max:160'],
			'creation_availability' => [
				'required',
				Rule::in(self::AVAILABILITY_OPTIONS),
			],
			'terms' => ['accepted'],
		];
	}

	/**
	 * Mensagens personalizadas para erros frequentes.
	 *
	 * @return array<string, string>
	 */
	public function messages(): array
	{
		return [
			'instagram_handle.required_without_all' => 'Informe ao menos uma @ de rede social.',
			'artist_types.required' => 'Selecione pelo menos um perfil artístico.',
			'participation_types.required' => 'Selecione pelo menos um tipo de participação.',
			'terms.accepted' => 'Você precisa aceitar o regulamento oficial para continuar.',
		];
	}

	/**
	 * Normaliza dados antes de executar as regras de validação.
	 */
	protected function prepareForValidation(): void
	{
		$this->merge([
			'stage_name' => $this->cleanText($this->input('stage_name')),
			'instagram_handle' => $this->normalizeHandle($this->input('instagram_handle')),
			'youtube_handle' => $this->normalizeHandle($this->input('youtube_handle')),
			'tiktok_handle' => $this->normalizeHandle($this->input('tiktok_handle')),
			'artist_types' => $this->normalizeSelection(
				$this->input('artist_types', []),
				self::ARTIST_TYPES,
			),
			'participation_types' => $this->normalizeSelection(
				$this->input('participation_types', []),
				self::PARTICIPATION_TYPES,
			),
			'other_artist_type' => $this->cleanText($this->input('other_artist_type')),
			'main_genre' => $this->cleanText($this->input('main_genre')),
			'city_state' => $this->cleanText($this->input('city_state')),
			'portfolio_link' => $this->cleanUrl($this->input('portfolio_link')),
			'terms' => $this->boolean('terms'),
		]);
	}

	private function cleanText(?string $value): ?string
	{
		$trimmed = $value !== null ? trim($value) : null;

		return $trimmed !== '' ? $trimmed : null;
	}

	private function cleanUrl(?string $value): ?string
	{
		$url = $this->cleanText($value);

		return $url !== null ? $url : null;
	}

	private function normalizeHandle(?string $handle): ?string
	{
		$clean = $this->cleanText($handle);

		if ($clean === null) {
			return null;
		}

		return str_starts_with($clean, '@') ? $clean : '@' . ltrim($clean, '@');
	}

	/**
	 * @param array<int, string>|string $selection
	 * @param list<string> $allowed
	 * @return array<int, string>
	 */
	private function normalizeSelection(array|string|null $selection, array $allowed): array
	{
		return collect(Arr::wrap($selection))
			->filter()
			->map(fn ($value) => (string) $value)
			->filter(fn ($value) => in_array($value, $allowed, true))
			->unique()
			->values()
			->all();
	}

	private function hasArtistType(string $type): bool
	{
		return in_array($type, $this->input('artist_types', []), true);
	}
}

