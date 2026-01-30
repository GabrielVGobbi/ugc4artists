<?php

declare(strict_types=1);

namespace App\Modules\Payments\Testing;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * Resolves mock fixtures for payment gateway endpoints.
 *
 * Maps HTTP method + endpoint patterns to fixture files and handles
 * dynamic parameter extraction from URLs.
 */
class MockResolver
{
    /**
     * Route patterns mapped to fixture paths.
     * Order matters: more specific patterns should come first.
     *
     * @var array<string, string>
     */
    protected array $routes = [
        // Customers
        'POST /customers' => 'customers/create',
        'GET /customers/{id}' => 'customers/find',
        'GET /customers' => 'customers/list',
        'PUT /customers/{id}' => 'customers/update',
        'DELETE /customers/{id}' => 'customers/delete',
        'POST /customers/{id}/restore' => 'customers/restore',

        // Payments
        'POST /payments' => 'payments/create',
        'GET /payments/{id}/pixQrCode' => 'payments/pixQrCode',
        'GET /payments/{id}/status' => 'payments/status',
        'GET /payments/{id}/identificationField' => 'payments/identificationField',
        'GET /payments/{id}' => 'payments/find',
        'GET /payments' => 'payments/list',
        'PUT /payments/{id}' => 'payments/update',
        'DELETE /payments/{id}' => 'payments/delete',
        'POST /payments/{id}/payWithCreditCard' => 'payments/payWithCreditCard',
        'POST /payments/{id}/refund' => 'payments/refund',
        'POST /payments/{id}/restore' => 'payments/restore',

        // Subscriptions
        'POST /subscriptions' => 'subscriptions/create',
        'GET /subscriptions/{id}/payments' => 'subscriptions/payments',
        'GET /subscriptions/{id}' => 'subscriptions/find',
        'GET /subscriptions' => 'subscriptions/list',
        'PUT /subscriptions/{id}' => 'subscriptions/update',
        'DELETE /subscriptions/{id}' => 'subscriptions/delete',

        // Transfers
        'POST /transfers' => 'transfers/create',
        'GET /transfers/{id}' => 'transfers/find',
        'GET /transfers' => 'transfers/list',
        'DELETE /transfers/{id}/cancel' => 'transfers/cancel',

        // Splits
        'GET /payments/splits/paid/{id}' => 'splits/paid-find',
        'GET /payments/splits/paid' => 'splits/paid-list',
        'GET /payments/splits/received/{id}' => 'splits/received-find',
        'GET /payments/splits/received' => 'splits/received-list',

        // Credit Card Tokenization
        'POST /creditCard/tokenizeCreditCard' => 'creditcard/tokenize',

        // Finance
        'GET /finance/balance' => 'finance/balance',
        'GET /financialTransactions' => 'finance/transactions',

        // Webhooks
        'POST /webhooks' => 'webhooks/create',
        'GET /webhooks/{id}' => 'webhooks/find',
        'GET /webhooks' => 'webhooks/list',
        'PUT /webhooks/{id}' => 'webhooks/update',
        'DELETE /webhooks/{id}' => 'webhooks/delete',
        'POST /webhooks/{id}/removeBackoff' => 'webhooks/find',
    ];

    /**
     * Runtime overrides for fixtures.
     *
     * @var array<string, array<string, mixed>>
     */
    protected static array $overrides = [];

    /**
     * Base path for fixture files.
     */
    protected string $fixturesBasePath;

    public function __construct()
    {
        $this->fixturesBasePath = __DIR__ . '/Fixtures';
    }

    /**
     * Resolve a fixture for the given method and endpoint.
     *
     * @param  string  $method  HTTP method (GET, POST, PUT, DELETE)
     * @param  string  $endpoint  API endpoint (e.g., /payments/pay_123/pixQrCode)
     * @param  string  $gateway  Gateway name (e.g., 'asaas')
     * @param  array<string, mixed>  $requestData  Request payload data
     * @return array{data: array<string, mixed>, params: array<string, string>}|null
     */
    public function resolve(
        string $method,
        string $endpoint,
        string $gateway,
        array $requestData = [],
    ): ?array {
        $method = strtoupper($method);
        $endpoint = $this->normalizeEndpoint($endpoint);

        // Check for runtime override first
        $overrideKey = "{$method} {$endpoint}";
        if (isset(self::$overrides[$overrideKey])) {
            return [
                'data' => self::$overrides[$overrideKey],
                'params' => [],
            ];
        }

        // Find matching route pattern
        foreach ($this->routes as $pattern => $fixturePath) {
            $match = $this->matchPattern($method, $endpoint, $pattern);

            if ($match !== null) {
                $fixtureData = $this->loadFixture($gateway, $fixturePath);

                if ($fixtureData === null) {
                    continue;
                }

                return [
                    'data' => $fixtureData,
                    'params' => $match,
                ];
            }
        }

        return null;
    }

    /**
     * Match an endpoint against a route pattern.
     *
     * @return array<string, string>|null Extracted parameters or null if no match
     */
    protected function matchPattern(string $method, string $endpoint, string $pattern): ?array
    {
        // Split pattern into method and path
        $parts = explode(' ', $pattern, 2);
        if (count($parts) !== 2) {
            return null;
        }

        [$patternMethod, $patternPath] = $parts;

        if ($patternMethod !== $method) {
            return null;
        }

        // Convert pattern to regex
        $regex = $this->patternToRegex($patternPath);
        $matches = [];

        if (preg_match($regex, $endpoint, $matches)) {
            // Extract named parameters
            $params = [];
            foreach ($matches as $key => $value) {
                if (is_string($key)) {
                    $params[$key] = $value;
                }
            }

            return $params;
        }

        return null;
    }

    /**
     * Convert a route pattern to a regex.
     */
    protected function patternToRegex(string $pattern): string
    {
        // Escape regex special chars except { and }
        $escaped = preg_quote($pattern, '/');

        // Replace {param} with named capture groups
        $regex = preg_replace(
            '/\\\{([a-zA-Z_]+)\\\}/',
            '(?P<$1>[^\/]+)',
            $escaped,
        );

        return '/^' . $regex . '$/';
    }

    /**
     * Normalize endpoint by removing leading/trailing slashes.
     */
    protected function normalizeEndpoint(string $endpoint): string
    {
        return '/' . trim($endpoint, '/');
    }

    /**
     * Load a fixture file for the given gateway.
     *
     * @return array<string, mixed>|null
     */
    protected function loadFixture(string $gateway, string $fixturePath): ?array
    {
        $gatewayPath = Str::studly($gateway);
        $fullPath = "{$this->fixturesBasePath}/{$gatewayPath}/{$fixturePath}.json";

        if (! File::exists($fullPath)) {
            return null;
        }

        $content = File::get($fullPath);
        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return null;
        }

        return $data;
    }

    /**
     * Override a route with custom fixture data at runtime.
     *
     * @param  string  $routeKey  Route key (e.g., 'POST /payments')
     * @param  array<string, mixed>  $data  Fixture data to return
     */
    public static function override(string $routeKey, array $data): void
    {
        self::$overrides[$routeKey] = $data;
    }

    /**
     * Clear a specific override.
     */
    public static function clearOverride(string $routeKey): void
    {
        unset(self::$overrides[$routeKey]);
    }

    /**
     * Clear all runtime overrides.
     */
    public static function clearAllOverrides(): void
    {
        self::$overrides = [];
    }

    /**
     * Add a custom route pattern at runtime.
     *
     * @param  string  $pattern  Route pattern (e.g., 'GET /custom/{id}')
     * @param  string  $fixturePath  Relative fixture path (e.g., 'custom/find')
     */
    public function addRoute(string $pattern, string $fixturePath): void
    {
        // Add to beginning for priority
        $this->routes = [$pattern => $fixturePath] + $this->routes;
    }

    /**
     * Get all registered routes.
     *
     * @return array<string, string>
     */
    public function getRoutes(): array
    {
        return $this->routes;
    }

    /**
     * Check if test mode is enabled.
     */
    public static function isTestModeEnabled(): bool
    {
        return (bool) config('payments.test_mode', false);
    }
}
