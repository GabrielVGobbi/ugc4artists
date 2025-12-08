<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $stage_name
 * @property array<int, string> $artist_types
 * @property array<int, string> $participation_types
 * @property string $creation_availability
 */
class WaitlistRegistration extends Model
{
	use HasFactory;

	/**
	 * @var list<string>
	 */
	protected $fillable = [
		'stage_name',
		'instagram_handle',
		'youtube_handle',
		'tiktok_handle',
		'contact_email',
		'artist_types',
		'other_artist_type',
		'main_genre',
		'participation_types',
		'portfolio_link',
		'city_state',
		'creation_availability',
		'terms_accepted_at',
	];

	/**
	 * @var array<string, string>
	 */
	protected $casts = [
		'artist_types' => 'array',
		'participation_types' => 'array',
		'terms_accepted_at' => 'datetime',
	];
}

