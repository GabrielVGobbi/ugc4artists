<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\Traits;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Trait for rate limiting functionality.
 */
trait HasRateLimiting
{
    protected function getRateLimitKey(): string
    {
        return 'gateway_rate_limit:' . $this->getGatewayName();
    }

    protected function getMaxAttempts(): int
    {
        return config("payments.gateways.{$this->getGatewayName()}.rate_limit.max_attempts", 60);
    }

    protected function getDecaySeconds(): int
    {
        return config("payments.gateways.{$this->getGatewayName()}.rate_limit.decay_seconds", 60);
    }

    protected function checkRateLimit(): bool
    {
        $key = $this->getRateLimitKey();

        if (RateLimiter::tooManyAttempts($key, $this->getMaxAttempts())) {
            return false;
        }

        RateLimiter::hit($key, $this->getDecaySeconds());

        return true;
    }

    protected function getRemainingAttempts(): int
    {
        return RateLimiter::remaining($this->getRateLimitKey(), $this->getMaxAttempts());
    }

    protected function getRetryAfter(): int
    {
        return RateLimiter::availableIn($this->getRateLimitKey());
    }

    protected function clearRateLimit(): void
    {
        RateLimiter::clear($this->getRateLimitKey());
    }

    abstract protected function getGatewayName(): string;
}
