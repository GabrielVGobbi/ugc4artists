<?php

declare(strict_types=1);

namespace App\Supports\Traits;

use Illuminate\Support\Str;

trait GenerateNameTrait
{
    public static function bootGenerateNameTrait(): void
    {
        static::creating(function ($model) {
            $model->name = titleCase($model->name);
        });

        self::updating(function ($model) {
            $model->name = titleCase($model->name);
        });
    }
}
