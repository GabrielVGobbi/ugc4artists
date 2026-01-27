<?php

namespace App\Services;

use App\Http\Resources\AddressResource;
use App\Models\Address;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class AddressService
{
    protected $userRepository;

    public function __construct() {}

    public function getAll($request, $model = null, $model_id = null)
    {
        if ($model_id != null && $model != null) {
            $modelInstance = $this->getModelAddressable($model_id, $model);
            return $modelInstance?->addresses()->get() ?: [];
        }

        return Address::ByUser()->paginate();
    }

    public function store($attributes, $model = null, $model_id = null)
    {
        if ($model_id != null && $model != null) {
            $modelInstance = $this->getModelAddressable($model_id, $model);

            throw_if(
                !$modelInstance,
                ValidationException::withMessages(['message' => 'Não autorizado!'])
            );

            if ($modelInstance->addresses()->count() === 0) {
                $attributes['is_default'] = true;
            }

            return $address = $modelInstance->addresses()->create($attributes);
        }

        if (auth()->user()->addresses()->count() === 0) {
            $attributes['is_default'] = true;
        }

        return auth()->user()->addresses()->create($attributes);
    }

    public function getAddressesByModel($model_id, $model = null)
    {
        return AddressResource::collection($this->getAll($model_id, $model));
    }

    private function getModelAddressable($id, $model)
    {
        return match ($model) {
            'user' => User::where('uuid', $id)->orWhere('id', $id)->first(),
            default => null
        };
    }
}
