<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUpdateAddress extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => ['required'],
            'street' => ['required'],
            'number' => ['required'],
            'complement' => ['nullable'],
            'neighborhood' => ['required'],
            'city' => ['required'],
            'state' => ['required'],
            'is_default' => ['sometimes', 'boolean'],
            'zipcode' => ['required'],

            'model_id' => ['nullable',],
            'model' => ['nullable', Rule::in('user')],
        ];
    }
}
