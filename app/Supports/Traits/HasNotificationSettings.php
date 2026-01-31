<?php

declare(strict_types=1);

namespace App\Supports\Traits;

use App\Models\NotificationSetting;
use Illuminate\Database\Eloquent\Relations\HasOne;

trait HasNotificationSettings
{
    /**
     * Get the notification settings for the user.
     */
    public function notificationSettings(): HasOne
    {
        return $this->hasOne(NotificationSetting::class);
    }

    /**
     * Get or create notification settings for the user.
     */
    public function getOrCreateNotificationSettings(): NotificationSetting
    {
        return $this->notificationSettings()->firstOrCreate(
            ['user_id' => $this->id],
            [
                'new_campaigns' => true,
                'payments_received' => true,
                'system_updates' => true,
                'performance_tips' => true,
                'new_campaigns_channel' => 'both',
                'payments_channel' => 'push',
                'system_updates_channel' => 'email',
                'performance_tips_channel' => 'push',
            ]
        );
    }
}
