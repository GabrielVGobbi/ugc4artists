<?php

declare(strict_types=1);

namespace App\Supports\Traits;

use Illuminate\Support\Str;

trait GenerateUniqueTokenTrait
{
    public static function bootGenerateUniqueTokenTrait(): void
    {
        static::saving(function ($model) {
            if (empty($model->token)) {
                $fillables = $model->getFillable();
                $nameToken = in_array('name', $fillables) ? 'name' : $fillables['0'];
                $token = token(12, false);
                $model->token = $model->generateUniqueToken($token);
            }
        });
    }

    public function generateUniqueToken(string $token): string
    {
        // Check if the modified token already exists in the table
        $existingTokens = $this->getExistingTokens($token, $this->getTable());

        if (!in_array($token, $existingTokens)) {
            // Token is unique, no need to append numbers
            return token(12, false);
        }

        return $token;
    }

    private function getExistingTokens(string $token, string $table): array
    {
        return $this->where('token', $token)
            ->where('id', '!=', $this->id ?? null) // Exclude the current model's ID
            ->pluck('token')
            ->toArray();
    }
}
