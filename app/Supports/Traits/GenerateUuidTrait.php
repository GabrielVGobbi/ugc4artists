<?php

declare(strict_types=1);

namespace App\Supports\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

trait GenerateUuidTrait
{
    public static function bootGenerateUuidTrait(): void
    {
        #static::saving(function ($model) {
        #    $model->uuid = uuid();
        #});

        #static::updat(function ($model) {
        #    $model->uuid = uuid();
        #});
        #
        self::creating(function ($model) {
            $table = $model->getTable();

            if (Schema::hasColumn($table, 'uuid')) {
                $model->uuid = uuid();
            } elseif (Schema::hasColumn($table, 'identify')) {
                $model->identify = uuid();
            }
        });

        #
        #self::created(function($model){
        #    // ... code here
        #});
        #
        #self::updating(function($model){
        #    // ... code here
        #});
        #
        #self::updated(function($model){
        #    // ... code here
        #});
        #
        #self::deleting(function($model){
        #    // ... code here
        #});
        #
        #self::deleted(function($model){
        #    // ... code here
        #});
    }

    /**
     * Scope para buscar por UUID ou ID
     *
     * @example User::byToken($value)->first();
     */
    public function scopeByToken(Builder $query, string|int $value): Builder
    {
        return $query->where(function ($q) use ($value) {
            if (is_numeric($value)) {
                $q->orWhere('id', (int) $value);
            }

            if (Schema::hasColumn($this->getTable(), 'uuid') && Str::isUuid($value)) {
                $q->orWhere('uuid', $value);
            }

            if (Schema::hasColumn($this->getTable(), 'identify') && Str::isUuid($value)) {
                $q->orWhere('identify', $value);
            }
        });
    }
}
