<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WaitlistRegistrationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'stage_name' => $this->stage_name,
            'contact_email' => $this->contact_email,

            // Social handles
            'instagram_handle' => $this->instagram_handle,
            'youtube_handle' => $this->youtube_handle,
            'tiktok_handle' => $this->tiktok_handle,

            // Details
            'artist_types' => $this->artist_types ?? [],
            'other_artist_type' => $this->other_artist_type,
            'main_genre' => $this->main_genre,
            'participation_types' => $this->participation_types ?? [],
            'portfolio_link' => $this->portfolio_link,
            'city_state' => $this->city_state,
            'creation_availability' => $this->creation_availability,

            // Status
            'terms_accepted_at' => $this->terms_accepted_at?->toDateTimeString(),
            'terms_accepted' => $this->terms_accepted_at !== null,
            'email_sent_at' => $this->email_sent_at?->toDateTimeString(),
            'email_sent' => $this->email_sent_at !== null,

            // Timestamps
            'created_at' => $this->created_at?->toDateTimeString(),
            'created_at_human' => $this->created_at?->diffForHumans(),
            'created_at_formatted' => $this->created_at?->format('d/m/Y H:i'),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'updated_at_human' => $this->updated_at?->diffForHumans(),
            'updated_at_formatted' => $this->updated_at?->format('d/m/Y H:i'),
            'terms_accepted_at_formatted' => $this->terms_accepted_at?->format('d/m/Y H:i'),
            'email_sent_at_formatted' => $this->email_sent_at?->format('d/m/Y H:i'),
        ];
    }
}
