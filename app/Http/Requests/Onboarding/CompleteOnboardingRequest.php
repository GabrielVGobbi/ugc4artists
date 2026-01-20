<?php

declare(strict_types=1);

namespace App\Http\Requests\Onboarding;

use Illuminate\Foundation\Http\FormRequest;

class CompleteOnboardingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $role = $this->input('role', 'artist');

        $commonRules = [
            'role' => ['required', 'string', 'in:artist,creator,brand'],
            'display_name' => ['required', 'string', 'min:2', 'max:60'],
            'country' => ['required', 'string', 'max:5'],
            'state' => ['required', 'string', 'max:2'],
            'city' => ['required', 'string', 'max:100'],
            'primary_language' => ['required', 'string', 'max:10'],
            'source' => ['required', 'string', 'max:50'],
            'expectation' => ['nullable', 'string', 'max:400'],
            'links' => ['nullable', 'array', 'max:6'],
            'links.*.type' => ['required_with:links', 'string'],
            'links.*.url' => ['required_with:links', 'url'],
        ];

        if ($role === 'artist') {
            return array_merge($commonRules, [
                'artist_type' => ['required', 'string', 'in:solo,band,dj_producer,other'],
                'primary_genre' => ['required', 'string'],
                'subgenres' => ['nullable', 'array', 'max:5'],
                'subgenres.*' => ['string'],
                'career_stage' => ['required', 'string', 'in:beginner,growing,established,professional'],
                'released_tracks_count' => ['required', 'string', 'in:0,1_3,4_10,10_plus'],
                'release_frequency' => ['nullable', 'string'],
                'next_release_window' => ['required', 'string', 'in:30d,60d,90d,unknown'],
                'release_type' => ['required_unless:next_release_window,unknown', 'nullable', 'string', 'in:single,ep,album'],
                'release_stage' => ['required_unless:next_release_window,unknown', 'nullable', 'string'],
                'has_cover_art' => ['nullable', 'boolean'],
                'has_release_date' => ['nullable', 'boolean'],
                'release_date' => ['nullable', 'date'],
                'platforms' => ['required', 'array', 'min:1'],
                'platforms.*' => ['string'],
                'audience_range' => ['required', 'string'],
                'primary_goal' => ['required', 'string'],
                'open_to' => ['required', 'array', 'min:1'],
                'open_to.*' => ['string'],
                'monetization_status' => ['nullable', 'string'],
            ]);
        }

        if ($role === 'creator') {
            return array_merge($commonRules, [
                'primary_handle' => ['nullable', 'string', 'max:30', 'regex:/^(@?[A-Za-z0-9._]{2,30})?$/'],
                'creator_type' => ['required', 'string', 'in:solo,couple,family,collective'],
                'niches' => ['required', 'array', 'min:1', 'max:5'],
                'niches.*' => ['string'],
                'audience_gender' => ['nullable', 'string', 'in:mostly_female,mostly_male,balanced,unknown'],
                'audience_age_range' => ['nullable', 'array', 'max:3'],
                'audience_age_range.*' => ['string'],
                'platforms' => ['required', 'array', 'min:1'],
                'platforms.*' => ['string'],
                'followers_range' => ['nullable', 'string'],
                'engagement_self_assessment' => ['nullable', 'string', 'in:low,medium,high,unknown'],
                'content_formats' => ['required', 'array', 'min:1'],
                'content_formats.*' => ['string'],
                'content_style' => ['required', 'array', 'min:1', 'max:3'],
                'content_style.*' => ['string'],
                'on_camera_presence' => ['required', 'string', 'in:always,sometimes,never'],
                'production_resources' => ['nullable', 'array'],
                'production_resources.*' => ['string'],
                'brand_experience_level' => ['required', 'string', 'in:never,sometimes,often'],
                'work_models' => ['required', 'array', 'min:1'],
                'work_models.*' => ['string'],
                'monthly_capacity' => ['required', 'string', 'in:1_2,3_5,5_plus'],
                'primary_goal' => ['required', 'string'],
                'disallowed_categories' => ['nullable', 'array'],
                'disallowed_categories.*' => ['string'],
                'exclusivity_preference' => ['nullable', 'string', 'in:yes,depends,no'],
                'preferred_brands_text' => ['nullable', 'string', 'max:300'],
            ]);
        }

        if ($role === 'brand') {
            return array_merge($commonRules, [
                'company_name' => ['required', 'string', 'min:2', 'max:80'],
                'brand_name' => ['nullable', 'string', 'max:80'],
                'industry' => ['required', 'string'],
                'company_size' => ['nullable', 'string'],
                'website' => ['nullable', 'url', 'max:255'],
                'contact_name' => ['required', 'string', 'min:2', 'max:80'],
                'contact_role' => ['required', 'string'],
                'contact_email' => ['required', 'email', 'max:255'],
                'contact_phone' => ['nullable', 'string', 'max:20'],
                'team_size_marketing' => ['nullable', 'string'],
                'primary_objective' => ['required', 'string'],
                'kpi_focus' => ['nullable', 'array', 'max:4'],
                'kpi_focus.*' => ['string'],
                'campaign_timeline' => ['required', 'string'],
                'creator_types' => ['required', 'array', 'min:1'],
                'creator_types.*' => ['string'],
                'platform_targets' => ['required', 'array', 'min:1'],
                'platform_targets.*' => ['string'],
                'target_niches' => ['nullable', 'array', 'max:6'],
                'target_niches.*' => ['string'],
                'creator_location_preference' => ['nullable', 'string'],
                'monthly_budget_range' => ['nullable', 'string'],
                'campaigns_per_month' => ['nullable', 'string'],
                'typical_deliverables' => ['nullable', 'array', 'max:5'],
                'typical_deliverables.*' => ['string'],
                'needs' => ['required', 'array', 'min:1', 'max:5'],
                'needs.*' => ['string'],
                'approval_flow' => ['nullable', 'string'],
                'disallowed_creator_categories' => ['nullable', 'array'],
                'disallowed_creator_categories.*' => ['string'],
                'brand_guidelines_url' => ['nullable', 'url', 'max:255'],
            ]);
        }

        return $commonRules;
    }

    public function messages(): array
    {
        return [
            // Common
            'display_name.required' => 'O nome artístico/público é obrigatório.',
            'display_name.min' => 'O nome deve ter pelo menos 2 caracteres.',
            'state.required' => 'O estado é obrigatório.',
            'city.required' => 'A cidade é obrigatória.',
            'source.required' => 'Por favor, informe onde nos conheceu.',
            
            // Artist/Creator
            'platforms.required' => 'Selecione pelo menos uma plataforma.',
            'platforms.min' => 'Selecione pelo menos uma plataforma.',
            'primary_goal.required' => 'Selecione seu objetivo principal.',
            'open_to.required' => 'Selecione pelo menos uma oportunidade.',
            'open_to.min' => 'Selecione pelo menos uma oportunidade.',
            'niches.required' => 'Selecione pelo menos um nicho.',
            'content_formats.required' => 'Selecione pelo menos um formato de conteúdo.',
            'content_style.required' => 'Selecione pelo menos um estilo.',
            'work_models.required' => 'Selecione pelo menos um modelo de trabalho.',
            
            // Brand
            'company_name.required' => 'O nome da empresa/marca é obrigatório.',
            'company_name.min' => 'O nome da empresa deve ter pelo menos 2 caracteres.',
            'industry.required' => 'Selecione o segmento da empresa.',
            'contact_name.required' => 'O nome do responsável é obrigatório.',
            'contact_role.required' => 'Informe em qual área você trabalha.',
            'contact_email.required' => 'O e-mail para contato é obrigatório.',
            'contact_email.email' => 'Informe um e-mail válido.',
            'primary_objective.required' => 'Selecione o objetivo principal da campanha.',
            'campaign_timeline.required' => 'Informe quando pretende lançar a primeira campanha.',
            'creator_types.required' => 'Selecione com quem você quer trabalhar.',
            'creator_types.min' => 'Selecione pelo menos um tipo de criador.',
            'platform_targets.required' => 'Selecione as plataformas alvo.',
            'platform_targets.min' => 'Selecione pelo menos uma plataforma.',
            'needs.required' => 'Selecione o que você precisa da plataforma.',
            'needs.min' => 'Selecione pelo menos uma necessidade.',
        ];
    }
}
