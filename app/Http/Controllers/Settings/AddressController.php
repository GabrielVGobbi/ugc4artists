<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\AddressUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    /**
     * Show the address settings form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $address = $user->defaultAddress();

        return Inertia::render('settings/address', [
            'address' => $address,
        ]);
    }

    /**
     * Update the user's billing address.
     */
    public function update(AddressUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // Find or create the default address
        $address = $user->addresses()->where('is_default', true)->first();

        if ($address) {
            $address->update($validated);
        } else {
            $user->addresses()->create([
                ...$validated,
                'is_default' => true,
            ]);
        }

        return back()->with('status', 'address-updated');
    }
}
