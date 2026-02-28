<?php

namespace App\Providers;

use App\Events\Campaign\CampaignCheckoutCompleted;
use App\Listeners\Campaign\LogCampaignTransaction;
use App\Listeners\Campaign\UpdateCampaignTransactionStatus;
use App\Modules\Payments\Events\PaymentFailed;
use App\Modules\Payments\Events\PaymentPaid;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->registerCampaignEvents();
    }

    private function registerCampaignEvents()
    {
        Event::listen(
            CampaignCheckoutCompleted::class,
            LogCampaignTransaction::class
        );

        Event::listen(
            PaymentPaid::class,
            [UpdateCampaignTransactionStatus::class, 'handlePaid']
        );

        Event::listen(
            PaymentFailed::class,
            [UpdateCampaignTransactionStatus::class, 'handleFailed']
        );
    }
}
