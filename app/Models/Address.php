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

class Address extends Model
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
        'street',
        'number',
        'district',
        'neighborhood',
        'city',
        'state',
        'zipcode',
        'complement',
        'country',
        'is_default',
        'state_registration'
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'zipcode' => OnlyNumber::class
        ];
    }

    protected $appends = ['fullAddress'];

    public function getfullAddressAttribute()
    {
        if ($this->street != '') {
            $address = $this;
            $street = $address->street;
            $number = $address->number;
            $complement = ''; #$address->complement != '' ? ", " . $address->complement : null;
            return $street . ", Nº " . $number . $complement;
        }

        return 'Endereço não informado';
    }

    public function addressable()
    {
        return $this->morphTo();
    }

    public function client()
    {
        return $this->morphTo('addressable');
    }

    public function scopeByUser($query, $userId = null)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('addressable_type', User::class);
            $q->where('addressable_id', $userId ?: Auth::user()->id);
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
