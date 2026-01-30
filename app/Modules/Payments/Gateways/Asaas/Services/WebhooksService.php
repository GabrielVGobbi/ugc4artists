<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways\Asaas\Services;

use App\Modules\Payments\Core\Abstract\AbstractService;
use App\Modules\Payments\Gateways\Asaas\AsaasConfiguration;

/**
 * Asaas webhooks service implementation.
 *
 * Manages webhook configurations via Asaas API.
 */
final class WebhooksService extends AbstractService
{
    /**
     * Payment-related webhook events.
     */
    public const PAYMENT_EVENTS = [
        'PAYMENT_CREATED',
        'PAYMENT_UPDATED',
        'PAYMENT_CONFIRMED',
        'PAYMENT_RECEIVED',
        'PAYMENT_OVERDUE',
        'PAYMENT_DELETED',
        'PAYMENT_RESTORED',
        'PAYMENT_REFUNDED',
        'PAYMENT_REFUND_IN_PROGRESS',
        'PAYMENT_CHARGEBACK_REQUESTED',
        'PAYMENT_CHARGEBACK_DISPUTE',
        'PAYMENT_AWAITING_CHARGEBACK_REVERSAL',
        'PAYMENT_PARTIALLY_REFUNDED',
    ];

    /**
     * Transfer-related webhook events.
     */
    public const TRANSFER_EVENTS = [
        'TRANSFER_CREATED',
        'TRANSFER_PENDING',
        'TRANSFER_IN_BANK_PROCESSING',
        'TRANSFER_BLOCKED',
        'TRANSFER_DONE',
        'TRANSFER_FAILED',
        'TRANSFER_CANCELLED',
    ];

    /**
     * Subscription-related webhook events.
     */
    public const SUBSCRIPTION_EVENTS = [
        'SUBSCRIPTION_CREATED',
        'SUBSCRIPTION_UPDATED',
        'SUBSCRIPTION_INACTIVATED',
        'SUBSCRIPTION_DELETED',
    ];

    /**
     * All recommended events for full functionality.
     */
    public const ALL_RECOMMENDED_EVENTS = [
        ...self::PAYMENT_EVENTS,
        ...self::TRANSFER_EVENTS,
        ...self::SUBSCRIPTION_EVENTS,
    ];

    public function __construct(AsaasConfiguration $configuration)
    {
        parent::__construct($configuration);
    }

    protected function getDefaultHeaders(): array
    {
        /** @var AsaasConfiguration $config */
        $config = $this->configuration;

        return $config->getDefaultHeaders();
    }

    /**
     * Create a new webhook configuration.
     *
     * @param  string  $url  Webhook URL
     * @param  array<string>  $events  Events to subscribe
     * @param  string|null  $name  Webhook name
     * @param  string|null  $authToken  Authentication token
     * @param  string|null  $email  Notification email
     * @return array<string, mixed>
     */
    public function create(
        string $url,
        array $events = [],
        ?string $name = null,
        ?string $authToken = null,
        ?string $email = null,
    ): array {
        $this->ensureApiKeyConfigured();

        $payload = [
            'url' => $url,
            'events' => $events ?: self::PAYMENT_EVENTS,
            'enabled' => true,
            'interrupted' => false,
            'apiVersion' => 3,
            'sendType' => 'SEQUENTIALLY',
        ];

        if ($name) {
            $payload['name'] = $name;
        }

        if ($authToken) {
            $payload['authToken'] = $authToken;
        }

        if ($email) {
            $payload['email'] = $email;
        }

        $response = $this->httpPost('/webhooks', $payload);

        return $response->json();
    }

    /**
     * Create webhook with all recommended events.
     *
     * @param  string  $url  Webhook URL
     * @param  string|null  $authToken  Authentication token for verification
     * @return array<string, mixed>
     */
    public function createWithAllEvents(
        string $url,
        ?string $authToken = null,
    ): array {
        return $this->create(
            url: $url,
            events: self::ALL_RECOMMENDED_EVENTS,
            name: 'UGC App Webhook',
            authToken: $authToken,
        );
    }

    /**
     * List all configured webhooks.
     *
     * @return array<string, mixed>
     */
    public function list(): array
    {
        $this->ensureApiKeyConfigured();

        $response = $this->httpGet('/webhooks');

        return $response->json();
    }

    /**
     * Find a webhook by ID.
     *
     * @return array<string, mixed>|null
     */
    public function find(string $id): ?array
    {
        $this->ensureApiKeyConfigured();

        try {
            $response = $this->httpGet("/webhooks/{$id}");

            return $response->json();
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Update a webhook configuration.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function update(string $id, array $data): array
    {
        $this->ensureApiKeyConfigured();

        $response = $this->httpPut("/webhooks/{$id}", $data);

        return $response->json();
    }

    /**
     * Delete a webhook configuration.
     */
    public function delete(string $id): bool
    {
        $this->ensureApiKeyConfigured();

        try {
            $this->httpDelete("/webhooks/{$id}");

            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * Enable a webhook.
     *
     * @return array<string, mixed>
     */
    public function enable(string $id): array
    {
        return $this->update($id, ['enabled' => true]);
    }

    /**
     * Disable a webhook.
     *
     * @return array<string, mixed>
     */
    public function disable(string $id): array
    {
        return $this->update($id, ['enabled' => false]);
    }

    /**
     * Remove webhook backoff (when in penalty).
     */
    public function removeBackoff(string $id): bool
    {
        $this->ensureApiKeyConfigured();

        try {
            $this->httpPost("/webhooks/{$id}/removeBackoff");

            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * Find existing webhook by URL.
     *
     * @return array<string, mixed>|null
     */
    public function findByUrl(string $url): ?array
    {
        $webhooks = $this->list();
        $data = $webhooks['data'] ?? [];

        foreach ($data as $webhook) {
            if (($webhook['url'] ?? '') === $url) {
                return $webhook;
            }
        }

        return null;
    }

    /**
     * Create or update webhook for URL.
     *
     * @param  string  $url  Webhook URL
     * @param  array<string>  $events  Events to subscribe
     * @param  string|null  $authToken  Authentication token
     * @return array<string, mixed>
     */
    public function createOrUpdate(
        string $url,
        array $events = [],
        ?string $authToken = null,
    ): array {
        $existing = $this->findByUrl($url);

        if ($existing) {
            $updateData = [
                'events' => $events ?: self::PAYMENT_EVENTS,
                'enabled' => true,
            ];

            if ($authToken) {
                $updateData['authToken'] = $authToken;
            }

            return $this->update($existing['id'], $updateData);
        }

        return $this->create(
            url: $url,
            events: $events,
            authToken: $authToken,
        );
    }

    /**
     * Get the webhook URL for this application.
     */
    public function getAppWebhookUrl(): string
    {
        return rtrim(config('app.url'), '/') . '/webhook/asaas';
    }

    /**
     * Setup webhook for this application.
     *
     * @return array<string, mixed>
     */
    public function setupAppWebhook(): array
    {
        $url = $this->getAppWebhookUrl();
        $authToken = config('payments.gateways.asaas.webhook_secret');

        return $this->createOrUpdate(
            url: $url,
            events: self::ALL_RECOMMENDED_EVENTS,
            authToken: $authToken,
        );
    }
}
