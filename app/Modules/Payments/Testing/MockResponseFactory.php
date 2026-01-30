<?php

declare(strict_types=1);

namespace App\Modules\Payments\Testing;

use GuzzleHttp\Psr7\Response as GuzzleResponse;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Str;

/**
 * Factory for creating fake HTTP Client responses.
 *
 * Creates Laravel HTTP Client Response objects from fixture data,
 * handling dynamic placeholder substitution.
 */
class MockResponseFactory
{
    /**
     * Placeholder processors.
     *
     * @var array<string, callable>
     */
    protected static array $processors = [];

    /**
     * Create a mock Response from fixture data.
     *
     * @param  array<string, mixed>  $data  Fixture data
     * @param  int  $status  HTTP status code
     * @param  array<string, string>  $params  URL parameters extracted from endpoint
     * @param  array<string, mixed>  $requestData  Original request data
     * @param  array<string, string>  $headers  Response headers
     */
    public static function make(
        array $data,
        int $status = 200,
        array $params = [],
        array $requestData = [],
        array $headers = [],
    ): Response {
        // Process placeholders in the data
        $processedData = self::processPlaceholders($data, $params, $requestData);

        // Create JSON body
        $body = json_encode($processedData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        // Default headers
        $defaultHeaders = [
            'Content-Type' => 'application/json',
            'X-Mock-Response' => 'true',
        ];

        $finalHeaders = array_merge($defaultHeaders, $headers);

        // Create Guzzle PSR-7 Response
        $guzzleResponse = new GuzzleResponse(
            status: $status,
            headers: $finalHeaders,
            body: $body,
        );

        // Create Laravel HTTP Client Response
        return new Response($guzzleResponse);
    }

    /**
     * Create an error response.
     *
     * @param  string  $message  Error message
     * @param  int  $status  HTTP status code
     * @param  array<string, mixed>  $errors  Additional error details
     */
    public static function makeError(
        string $message,
        int $status = 400,
        array $errors = [],
    ): Response {
        $data = [
            'errors' => array_merge(
                [['code' => 'mock_error', 'description' => $message]],
                $errors,
            ),
        ];

        return self::make($data, $status);
    }

    /**
     * Process placeholders in fixture data.
     *
     * @param  mixed  $data  Data to process
     * @param  array<string, string>  $params  URL parameters
     * @param  array<string, mixed>  $requestData  Request payload
     * @return mixed
     */
    protected static function processPlaceholders(
        mixed $data,
        array $params,
        array $requestData,
    ): mixed {
        if (is_string($data)) {
            return self::replacePlaceholders($data, $params, $requestData);
        }

        if (is_array($data)) {
            $result = [];
            foreach ($data as $key => $value) {
                $processedKey = is_string($key)
                    ? self::replacePlaceholders($key, $params, $requestData)
                    : $key;
                $result[$processedKey] = self::processPlaceholders($value, $params, $requestData);
            }

            return $result;
        }

        return $data;
    }

    /**
     * Replace placeholders in a string.
     *
     * Supported placeholders:
     * - {id} - ID from URL params
     * - {uuid} - Generated UUID
     * - {date} - Current date (Y-m-d)
     * - {datetime} - Current datetime (Y-m-d H:i:s)
     * - {timestamp} - Unix timestamp
     * - {request.field} - Value from request data
     * - {param.name} - Value from URL params
     */
    protected static function replacePlaceholders(
        string $value,
        array $params,
        array $requestData,
    ): string {
        // Built-in placeholders
        $replacements = [
            '{uuid}' => (string) Str::uuid(),
            '{date}' => date('Y-m-d'),
            '{datetime}' => date('Y-m-d H:i:s'),
            '{timestamp}' => (string) time(),
            '{year}' => date('Y'),
            '{month}' => date('m'),
            '{day}' => date('d'),
        ];

        // Add URL params
        foreach ($params as $key => $paramValue) {
            $replacements["{{$key}}"] = $paramValue;
            $replacements["{param.{$key}}"] = $paramValue;
        }

        // Process request data placeholders
        $value = preg_replace_callback(
            '/\{request\.([a-zA-Z0-9_.]+)\}/',
            function ($matches) use ($requestData) {
                return self::getNestedValue($requestData, $matches[1]) ?? $matches[0];
            },
            $value,
        );

        // Process custom processors
        foreach (self::$processors as $pattern => $processor) {
            $value = preg_replace_callback(
                $pattern,
                $processor,
                $value,
            );
        }

        // Apply standard replacements
        return str_replace(
            array_keys($replacements),
            array_values($replacements),
            $value,
        );
    }

    /**
     * Get a nested value from an array using dot notation.
     *
     * @param  array<string, mixed>  $data
     */
    protected static function getNestedValue(array $data, string $key): ?string
    {
        $keys = explode('.', $key);
        $value = $data;

        foreach ($keys as $k) {
            if (! is_array($value) || ! isset($value[$k])) {
                return null;
            }
            $value = $value[$k];
        }

        if (is_scalar($value)) {
            return (string) $value;
        }

        return null;
    }

    /**
     * Register a custom placeholder processor.
     *
     * @param  string  $pattern  Regex pattern to match
     * @param  callable  $processor  Callback to process matches
     */
    public static function registerProcessor(string $pattern, callable $processor): void
    {
        self::$processors[$pattern] = $processor;
    }

    /**
     * Clear all custom processors.
     */
    public static function clearProcessors(): void
    {
        self::$processors = [];
    }

    /**
     * Merge fixture data with request data for responses that echo back request values.
     *
     * @param  array<string, mixed>  $fixture  Base fixture data
     * @param  array<string, mixed>  $requestData  Request data to merge
     * @param  array<string>  $fields  Fields to merge from request
     * @return array<string, mixed>
     */
    public static function mergeRequestData(
        array $fixture,
        array $requestData,
        array $fields = [],
    ): array {
        if (empty($fields)) {
            // Merge all request data by default
            return array_merge($fixture, $requestData);
        }

        foreach ($fields as $field) {
            if (isset($requestData[$field])) {
                $fixture[$field] = $requestData[$field];
            }
        }

        return $fixture;
    }
}
