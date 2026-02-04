<?php

declare(strict_types=1);

namespace App\Http\Requests\Campaign;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Informações Básicas
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'kind' => ['nullable', Rule::in(['ugc', 'influencers'])],
            'influencer_post_mode' => [
                'nullable',
                Rule::in(['profile', 'collab']),
            ],

            // Música / Conteúdo
            'music_platform' => ['nullable', Rule::in(['spotify', 'youtube', 'deezer', 'other'])],
            'music_link' => ['nullable', 'url', 'max:500'],

            // Produto/Serviço e Objetivo
            'product_or_service' => ['nullable', 'string', 'max:2000'],
            'objective' => ['nullable', 'string', 'max:2000'],
            'objective_tags' => ['nullable', 'array'],
            'objective_tags.*' => ['string', Rule::in([
                'divulgar_musica',
                'divulgar_clipe',
                'divulgar_perfil',
                'divulgar_trend',
                'outros',
            ])],

            // Briefing
            'briefing_mode' => ['nullable', Rule::in(['has_briefing', 'create_for_me'])],
            'description' => ['nullable', 'string', 'max:10000'],
            'terms_accepted' => ['nullable', 'boolean'],

            // Perfil do Influencer
            'creator_profile_type' => ['nullable', Rule::in(['influencer', 'page', 'both'])],
            'content_platforms' => ['nullable', 'array'],
            'content_platforms.*' => ['string', Rule::in(['instagram', 'tiktok', 'youtube', 'youtube_shorts'])],
            'audio_format' => ['nullable', Rule::in(['music', 'narration'])],
            'video_duration_min' => ['nullable', 'integer', 'min:1', 'max:600'],
            'video_duration_max' => ['nullable', 'integer', 'min:1', 'max:600', 'gte:video_duration_min'],

            // Filtros/Restrições
            'filter_age_min' => ['nullable', 'integer', 'min:13', 'max:100'],
            'filter_age_max' => ['nullable', 'integer', 'min:13', 'max:100', 'gte:filter_age_min'],
            'filter_gender' => ['nullable', Rule::in(['female', 'male', 'both'])],
            'filter_niches' => ['nullable', 'array'],
            'filter_niches.*' => ['string', 'max:100'],
            'filter_states' => ['nullable', 'array'],
            'filter_states.*' => ['string', 'max:2'],
            'filter_min_followers' => ['nullable', 'integer', 'min:0'],

            // Cronograma
            'requires_product_shipping' => ['nullable', 'boolean'],
            'applications_open_date' => ['nullable', 'date', 'after_or_equal:today'],
            'applications_close_date' => ['nullable', 'date', 'after_or_equal:applications_open_date'],
            'payment_date' => ['nullable', 'date', 'after_or_equal:applications_close_date'],

            // Orçamento
            'slots_to_approve' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'price_per_influencer' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'requires_invoice' => ['nullable', 'boolean'],

            // Apresentação da Marca
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'brand_instagram' => ['nullable', 'string', 'max:100'],

            // Tipo de Publicação
            'publication_plan' => ['nullable', Rule::in(['basic', 'highlight', 'premium'])],
            'publication_fee' => ['nullable', 'numeric', 'min:0'],

            // Responsável
            'responsible_name' => ['nullable', 'string', 'max:255'],
            'responsible_cpf' => ['nullable', 'string', 'max:14'],
            'responsible_phone' => ['nullable', 'string', 'max:20'],
            'responsible_email' => ['nullable', 'email', 'max:255'],

            // Usar meus dados
            'use_my_data' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'O nome da campanha é obrigatório.',
            'name.min' => 'O nome deve ter pelo menos 3 caracteres.',
            'music_link.url' => 'Insira um link válido para a música.',
            'video_duration_max.gte' => 'A duração máxima deve ser maior ou igual à mínima.',
            'filter_age_max.gte' => 'A idade máxima deve ser maior ou igual à mínima.',
            'applications_close_date.after_or_equal' => 'A data de encerramento deve ser após a abertura.',
            'payment_date.after_or_equal' => 'A data de pagamento deve ser após o encerramento das inscrições.',
            'cover_image.image' => 'O arquivo deve ser uma imagem.',
            'cover_image.max' => 'A imagem deve ter no máximo 5MB.',
            'responsible_email.email' => 'Insira um e-mail válido.',
        ];
    }
}
