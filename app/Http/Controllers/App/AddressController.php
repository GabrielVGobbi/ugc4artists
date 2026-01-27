<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUpdateAddress;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use App\Services\AddressService;
use App\Supports\TheOneResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AddressController extends Controller
{
    public function __construct(private AddressService $addressService) {}

    public function getAddressesByLoggedUser(Request $request)
    {
        $addresses = Auth::user()->addresses()->paginate();

        return AddressResource::collection($addresses);
    }

    public function index(Request $request)
    {
        $address = $this->addressService->getAll(
            [],
            $request->input('model', null),
            $request->input('model_id', null)
        );

        return AddressResource::collection($address);
    }

    public function store(StoreUpdateAddress $request)
    {
        $address = $this->addressService->store(
            $request->validated(),
            $request->input('model', null),
            $request->input('model_id', null)
        );

        if ($request->expectsJson()) {
            return new AddressResource($address);
        }

        return back(303);
    }

    public function show($address_id)
    {
        if (!$address = Address::ByUser()->where('id', $address_id)->first()) {
            return TheOneResponse::notFound('Address not found');
        }

        return new AddressResource($address);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     */
    public function update(StoreUpdateAddress $request, $address_id)
    {
        if (!$address = Address::byKey($address_id)->byUser()->first()) {
            return TheOneResponse::notFound('Provider not found');
        }

        $address->update($request->validated());

        return new AddressResource($address);
    }

    public function getAddressesByModel(Request $request)
    {
        return $this->addressService->getAddressesByModel(
            $request->input('model', null),
            $request->input('model_id', null)
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     */
    public function destroy($address_id)
    {
        if (!$address = Address::whereUuid($address_id)->byUser()->first()) {
            return TheOneResponse::notFound('Provider not found');
        }

        $address->delete();

        return TheOneResponse::ok(
            ['message' => 'Endereço deletado com sucesso',]
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     */
    public function me_update(StoreUpdateAddress $request, $address_id)
    {
        if (!$address = Address::whereUuid($address_id)->byUser()->first()) {
            return TheOneResponse::notFound('Provider not found');
        }

        $address->update($request->validated());

        return new AddressResource($address);
    }
}
