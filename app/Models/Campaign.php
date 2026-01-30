<?php

namespace App\Models;

use App\Casts\OnlyNumber;
use App\Models\User;
use App\Supports\Traits\GenerateUniqueSlugTrait;
use App\Supports\Traits\GenerateUuidTrait;
use App\Supports\Traits\LogTrait;
use App\Supports\Traits\Searchable\SearchableTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\Traits\LogsActivity;

class Campaign extends Model
{
    use HasFactory, GenerateUuidTrait, SoftDeletes;

    #protected $primaryKey = 'uuid';

    public $searchable = ['*'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [];
    }

    protected $appends = [];


    public function scopeByUser($query, $userId = null)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('user_id', User::class);
        });
    }

    public function scopeByKey($query, $key)
    {
        return $query->where(function ($q) use ($key) {
            $q->where('uuid', $key);
            $q->orWhere('id', $key);
        });
    }
}
