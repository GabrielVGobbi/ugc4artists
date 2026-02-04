<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaignResource extends JsonResource
{
    /**
     * @param  Request  $request
     */
    public function toArray($request): array
    {
        $pricePerInfluencer = (float) ($this->price_per_influencer ?? 0);
        $slotsToApprove     = (int) ($this->slots_to_approve ?? 0);
        $estimatedTotal     = $slotsToApprove * $pricePerInfluencer;

        $publicationFee = (float) ($this->publication_fee ?? 0);
        $grandTotal     = $estimatedTotal + $publicationFee;

        // Arrays (caso seu banco não tenha casts ainda, isso evita vir string)
        $objectiveTags     = $this->asArray($this->objective_tags);
        $contentPlatforms  = $this->asArray($this->content_platforms);
        $filterNiches      = $this->asArray($this->filter_niches);
        $filterStates      = $this->asArray($this->filter_states);

        $hasFilters = ! empty($this->filter_age_min)
            || ! empty($this->filter_age_max)
            || ! empty($this->filter_gender)
            || ! empty($filterNiches)
            || ! empty($filterStates)
            || ! empty($this->filter_min_followers);

        return [
            'id' => $this->id,
            'uuid' => $this->uuid ?? null, // se você tem coluna uuid via trait
            'user_id' => $this->user_id,

            // Básico
            'name' => $this->name,
            'slug' => $this->slug,
            'kind' => $this->kind, // ugc | influencers
            'influencer_post_mode' => $this->influencer_post_mode, // profile | collab

            // Música / conteúdo
            'music_platform' => $this->music_platform,
            'music_link' => $this->music_link,

            // Produto/objetivo
            'product_or_service' => $this->product_or_service,
            'objective' => $this->objective,
            'objective_tags' => $objectiveTags,

            // Briefing
            'briefing_mode' => $this->briefing_mode,
            'description' => $this->description,
            'terms_accepted' => (bool) $this->terms_accepted,

            // Perfil do creator
            'creator_profile_type' => $this->creator_profile_type,
            'content_platforms' => $contentPlatforms,
            'audio_format' => $this->audio_format,
            'video_duration_min' => $this->video_duration_min,
            'video_duration_max' => $this->video_duration_max,

            // Filtros (opcionais)
            'filters' => [
                'age_min' => $this->filter_age_min,
                'age_max' => $this->filter_age_max,
                'gender' => $this->filter_gender,
                'niches' => $filterNiches,
                'states' => $filterStates,
                'min_followers' => $this->filter_min_followers,
            ],

            // Cronograma
            'requires_product_shipping' => (bool) $this->requires_product_shipping,
            'applications_open_date' => $this->applications_open_date?->format('d/m/Y'),
            'applications_close_date' => $this->applications_close_date?->format('d/m/Y'),
            'payment_date' => $this->payment_date?->format('d/m/Y'),

            // Orçamento
            'slots_to_approve' => $slotsToApprove,
            'price_per_influencer' => $pricePerInfluencer,
            'requires_invoice' => (bool) $this->requires_invoice,

            // Branding
            'cover_image' => $this->cover_image,
            'cover_image_url' => $this->cover_image_url,
            'brand_instagram' => $this->brand_instagram,

            // Publicação
            'publication_plan' => $this->publication_plan,
            'publication_fee' => $publicationFee,

            // Responsável interno
            'responsible' => [
                'name' => $this->responsible_name,
                'cpf' => $this->responsible_cpf,
                'phone' => $this->responsible_phone,
                'email' => $this->responsible_email,
            ],

            // Status / revisão
            'review' => [
                'status' => $this->status,
                'submitted_at' => $this->formatDateTime($this->submitted_at),
                'approved_at' => $this->formatDateTime($this->approved_at),
                'rejected_at' => $this->formatDateTime($this->rejected_at),
                'rejection_reason' => $this->rejection_reason,
                'reviewed_by' => $this->reviewed_by,
            ],

            // Resumos úteis pro front
            'summary' => [
                'has_optional_filters' => $hasFilters,
                'estimated_total' => $estimatedTotal,
                'grand_total' => $grandTotal,
                'duration_days' => $this->durationDays(),
            ],

            // Metas
            'created_at' => $this->formatDateTime($this->created_at),
            'updated_at' => $this->formatDateTime($this->updated_at),
            'deleted_at' => $this->formatDateTime($this->deleted_at),
            'use_my_data' => $this->use_my_data,

            'user' => $this->whenLoaded('user', fn() => new UserResource($this->user)),
        ];
    }

    private function formatDate($value): ?string
    {
        if (! $value) return null;

        // date cast vira Carbon, string também funciona
        try {
            return \Illuminate\Support\Carbon::parse($value)->toDateString(); // YYYY-MM-DD
        } catch (\Throwable) {
            return null;
        }
    }

    private function formatDateTime($value): ?string
    {
        if (! $value) return null;

        try {
            return \Illuminate\Support\Carbon::parse($value)->toISOString(); // ISO 8601
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Garante array mesmo se vier JSON string.
     */
    private function asArray($value): array
    {
        if (is_array($value)) return $value;
        if (is_null($value) || $value === '') return [];

        // Se vier string JSON
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : [];
        }

        return [];
    }

    private function durationDays(): ?int
    {
        if (! $this->applications_open_date || ! $this->applications_close_date) {
            return null;
        }

        try {
            $start = \Illuminate\Support\Carbon::parse($this->applications_open_date)->startOfDay();
            $end   = \Illuminate\Support\Carbon::parse($this->applications_close_date)->startOfDay();

            return $start->diffInDays($end) + 1; // inclusivo
        } catch (\Throwable) {
            return null;
        }
    }
}
