<?php

declare(strict_types=1);

namespace App\Http\Requests\Campaign;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class UpdateCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normaliza datas antes da validação.
     * Aceita vários formatos e converte para 'Y-m-d'.
     */
    protected function prepareForValidation(): void
    {
        $dateFields = [
            'applications_open_date',
            'applications_close_date',
            'payment_date',
        ];

        $normalized = [];

        foreach ($dateFields as $field) {
            if (!$this->has($field)) {
                continue;
            }

            $value = $this->input($field);

            // Permite null, "", " " etc sem quebrar
            if ($value === null || (is_string($value) && trim($value) === '')) {
                $normalized[$field] = null;
                continue;
            }

            $parsed = $this->parseDateToYmd($value);

            // Se conseguiu parsear, substitui pelo formato único
            // Se não conseguiu, mantém como está (vai falhar na validação "date")
            if ($parsed !== null) {
                $normalized[$field] = $parsed;
            }
        }

        if (!empty($normalized)) {
            $this->merge($normalized);
        }
    }

    /**
     * Tenta converter uma data vinda em formatos comuns para 'Y-m-d'.
     * Retorna null se não conseguir parsear.
     */
    private function parseDateToYmd(mixed $value): ?string
    {
        // Se já vier como timestamp numérico (ex: 1700000000)
        if (is_int($value) || (is_string($value) && ctype_digit($value))) {
            try {
                return Carbon::createFromTimestamp((int) $value)->format('Y-m-d');
            } catch (\Throwable) {
                return null;
            }
        }

        if (!is_string($value)) {
            return null;
        }

        $value = trim($value);

        // Lista de formatos aceitos (adicione/remova conforme seu app)
        $formats = [
            'Y-m-d',
            'Y/m/d',
            'd/m/Y',
            'd-m-Y',
            'd.m.Y',
            'Y-m-d H:i',
            'Y-m-d H:i:s',
            'd/m/Y H:i',
            'd/m/Y H:i:s',
            'd-m-Y H:i',
            'd-m-Y H:i:s',
        ];

        foreach ($formats as $format) {
            try {
                $dt = Carbon::createFromFormat($format, $value);

                // Garante que o parse foi “exato” (evita 32/13/2026 virar algo esquisito)
                if ($dt && $dt->format($format) === $value) {
                    return $dt->format('Y-m-d');
                }
            } catch (\Throwable) {
                // tenta o próximo formato
            }
        }

        // Última tentativa: parser "solto" do Carbon (aceita muita coisa, mas pode ser ambíguo)
        try {
            return Carbon::parse($value)->format('Y-m-d');
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Informações Básicas
            'name' => ['sometimes', 'string', 'min:3', 'max:255'],
            'kind' => ['sometimes', Rule::in(['ugc', 'influencers'])],
            'influencer_post_mode' => ['nullable', Rule::in(['profile', 'collab'])],

            // Música / Conteúdo
            'music_platform' => ['nullable', Rule::in(['spotify', 'youtube', 'deezer', 'other'])],
            'music_link' => ['nullable', 'max:500', function ($attribute, $value, $fail) {
                if (empty($value)) return;
                if (!filter_var($value, FILTER_VALIDATE_URL)) {
                    $fail('Insira um link válido para a música.');
                }
            }],

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
            'filter_age_max' => ['nullable', 'integer', 'min:13', 'max:100'],
            'filter_gender' => ['nullable', Rule::in(['female', 'male', 'both'])],
            'filter_niches' => ['nullable', 'array'],
            'filter_niches.*' => ['string', 'max:100'],
            'filter_states' => ['nullable', 'array'],
            'filter_states.*' => ['string', 'max:2'],
            'filter_min_followers' => ['nullable', 'integer', 'min:0'],

            // Cronograma (agora as datas já estarão normalizadas para Y-m-d)
            'requires_product_shipping' => ['nullable', 'boolean'],
            'applications_open_date' => ['nullable', 'date_format:Y-m-d'],
            'applications_close_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:applications_open_date'],
            'payment_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:applications_close_date'],

            // Orçamento
            'slots_to_approve' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'price_per_influencer' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'requires_invoice' => ['nullable', 'boolean'],

            // Apresentação da Marca
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_cover_image' => ['nullable', 'boolean'],
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

    public function messages(): array
    {
        return [
            'applications_open_date.date_format' => 'A data de abertura deve estar em um formato válido.',
            'applications_close_date.date_format' => 'A data de encerramento deve estar em um formato válido.',
            'payment_date.date_format' => 'A data de pagamento deve estar em um formato válido.',
            'applications_close_date.after_or_equal' => 'A data de encerramento deve ser após a abertura.',
            'payment_date.after_or_equal' => 'A data de pagamento deve ser após o encerramento das inscrições.',
        ];
    }
}
