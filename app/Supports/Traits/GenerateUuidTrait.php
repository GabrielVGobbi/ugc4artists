<?php

declare(strict_types=1);

namespace App\Supports\Traits;

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
}
