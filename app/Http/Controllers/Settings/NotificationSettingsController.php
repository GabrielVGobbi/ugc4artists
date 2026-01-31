<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\NotificationSettingsRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationSettingsController extends Controller
{
    /**
     * Show the notification settings form.
     */
    public function edit(Request $request): Response
    {
        $settings = $request->user()->getOrCreateNotificationSettings();

        return Inertia::render('settings/notifications', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update the notification settings.
     */
    public function update(NotificationSettingsRequest $request): RedirectResponse
    {
        $settings = $request->user()->getOrCreateNotificationSettings();

        $settings->update($request->validated());

        return back()->with('status', 'notification-settings-updated');
    }
}
