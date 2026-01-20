<?php

declare(strict_types=1);

namespace App\Services\Onboarding;

use App\Models\OnboardingProfile;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class OnboardingService
{
    private const CACHE_PREFIX = 'onboarding_progress_';
    private const CACHE_TTL = 60 * 60 * 24 * 7; // 7 dias

    /**
     * Retorna a chave de cache para o usuário
     */
    private function getCacheKey(int $userId): string
    {
        return self::CACHE_PREFIX . $userId;
    }

    /**
     * Salva o progresso parcial do onboarding no cache
     */
    public function saveProgress(User $user, array $data, int $currentStep): array
    {
        $cacheKey = $this->getCacheKey($user->id);

        $progress = [
            'current_step' => $currentStep,
            'data' => $data,
            'updated_at' => now()->toIso8601String(),
        ];

        Cache::put($cacheKey, $progress, self::CACHE_TTL);

        return $progress;
    }

    /**
     * Recupera o progresso do onboarding do cache
     */
    public function getProgress(User $user): ?array
    {
        $cacheKey = $this->getCacheKey($user->id);

        return Cache::get($cacheKey);
    }

    /**
     * Limpa o progresso do cache
     */
    public function clearProgress(User $user): void
    {
        $cacheKey = $this->getCacheKey($user->id);
        Cache::forget($cacheKey);
    }

    /**
     * Finaliza o onboarding, salvando todos os dados no banco
     */
    public function completeOnboarding(User $user, array $data): OnboardingProfile
    {
        return DB::transaction(function () use ($user, $data) {
            $role = $data['role'] ?? 'artist';
            
            // Para marcas, usa company_name como display_name
            $displayName = $role === 'brand' 
                ? ($data['company_name'] ?? $data['display_name'] ?? $user->name)
                : ($data['display_name'] ?? $user->name);

            // Extrai campos comuns
            $commonFields = [
                'user_id' => $user->id,
                'role' => $role,
                'display_name' => $displayName,
                'country' => $data['country'] ?? 'BR',
                'state' => $data['state'] ?? null,
                'city' => $data['city'] ?? null,
                'primary_language' => $data['primary_language'] ?? 'pt-BR',
                'source' => $data['source'] ?? null,
                'expectation' => $data['expectation'] ?? null,
                'links' => $data['links'] ?? [],
            ];

            // Dados específicos do perfil baseado no role
            $profileData = $this->extractProfileData($data);
            $commonFields['profile_data'] = $profileData;

            // Cria ou atualiza o perfil
            $profile = OnboardingProfile::updateOrCreate(
                ['user_id' => $user->id],
                $commonFields
            );

            // Marca o onboarding como completo e atualiza o nome do usuário
            $user->update([
                'onboarding_completed_at' => now(),
                'name' => $displayName,
            ]);

            // Limpa o cache de progresso
            $this->clearProgress($user);

            return $profile;
        });
    }

    /**
     * Extrai dados específicos do perfil baseado no role
     */
    private function extractProfileData(array $data): array
    {
        $role = $data['role'] ?? 'artist';

        // Campos que não são do profile_data
        $excludedFields = [
            'role', 'display_name', 'country', 'state', 'city',
            'primary_language', 'source', 'expectation', 'links',
        ];

        $profileData = [];

        if ($role === 'artist') {
            $artistFields = [
                'artist_type', 'primary_genre', 'subgenres', 'career_stage',
                'released_tracks_count', 'release_frequency', 'next_release_window',
                'release_type', 'release_stage', 'has_cover_art', 'has_release_date',
                'release_date', 'platforms', 'audience_range', 'primary_goal',
                'open_to', 'monetization_status',
            ];

            foreach ($artistFields as $field) {
                if (isset($data[$field])) {
                    $profileData[$field] = $data[$field];
                }
            }
        } elseif ($role === 'creator') {
            $creatorFields = [
                'primary_handle', 'creator_type', 'niches', 'audience_gender',
                'audience_age_range', 'platforms', 'followers_range',
                'engagement_self_assessment', 'content_formats', 'content_style',
                'on_camera_presence', 'production_resources', 'brand_experience_level',
                'work_models', 'monthly_capacity', 'primary_goal',
                'disallowed_categories', 'exclusivity_preference', 'preferred_brands_text',
            ];

            foreach ($creatorFields as $field) {
                if (isset($data[$field])) {
                    $profileData[$field] = $data[$field];
                }
            }
        } elseif ($role === 'brand') {
            $brandFields = [
                'company_name', 'brand_name', 'industry', 'company_size', 'website',
                'contact_name', 'contact_role', 'contact_email', 'contact_phone',
                'team_size_marketing', 'primary_objective', 'kpi_focus', 'campaign_timeline',
                'creator_types', 'platform_targets', 'target_niches', 'creator_location_preference',
                'monthly_budget_range', 'campaigns_per_month', 'typical_deliverables',
                'needs', 'approval_flow', 'disallowed_creator_categories', 'brand_guidelines_url',
            ];

            foreach ($brandFields as $field) {
                if (isset($data[$field])) {
                    $profileData[$field] = $data[$field];
                }
            }
        }

        return $profileData;
    }

    /**
     * Retorna os dados do onboarding de um usuário
     */
    public function getOnboardingData(User $user): ?array
    {
        // Primeiro verifica se há progresso no cache
        $progress = $this->getProgress($user);

        if ($progress) {
            return $progress;
        }

        // Se o onboarding foi completado, retorna os dados do banco
        $profile = $user->onboardingProfile;

        if ($profile) {
            $data = array_merge(
                $profile->only(['role', 'display_name', 'country', 'state', 'city', 'primary_language', 'source', 'expectation', 'links']),
                $profile->profile_data ?? []
            );

            return [
                'current_step' => -1, // Indica que já foi completado
                'data' => $data,
                'completed' => true,
            ];
        }

        return null;
    }
}
