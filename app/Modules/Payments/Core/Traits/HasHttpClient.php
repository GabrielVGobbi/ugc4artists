<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\Traits;

use App\Modules\Payments\Core\Contracts\ConfigurationInterface;
use App\Modules\Payments\Exceptions\GatewayException;
use App\Modules\Payments\Exceptions\GatewayUnavailableException;
use App\Modules\Payments\Testing\MockResolver;
use App\Modules\Payments\Testing\MockResponseFactory;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Trait for HTTP client functionality with retry and error handling.
 */
trait HasHttpClient
{
    protected ?PendingRequest $httpClientInstance = null;

    abstract protected function getConfiguration(): ConfigurationInterface;

    abstract protected function getDefaultHeaders(): array;

    protected function httpClient(): PendingRequest
    {
        if ($this->httpClientInstance !== null) {
            return $this->httpClientInstance;
        }

        $config = $this->getConfiguration();
        $retryConfig = $config->getRetryConfig();

        $this->httpClientInstance = Http::baseUrl($config->getBaseUrl())
            ->timeout($config->getTimeout())
            ->retry(
                times: $retryConfig['attempts'],
                sleepMilliseconds: $retryConfig['delay'],
                when: fn($exception) => $exception instanceof ConnectionException,
                throw: false,
            )
            ->withHeaders($this->getDefaultHeaders())
            ->acceptJson();

        return $this->httpClientInstance;
    }

    protected function request(
        string $method,
        string $endpoint,
        array $data = [],
        ?string $context = null,
    ): Response {
        $this->logRequest($method, $endpoint, $data, $context);

        // Check if test mode is enabled and try to resolve a mock
        if ($this->shouldUseMockResponse()) {
            $mockResponse = $this->tryResolveMockResponse($method, $endpoint, $data);
            if ($mockResponse !== null) {
                $this->logMockResponse($mockResponse, $endpoint, $context);

                return $mockResponse;
            }
        }

        try {
            $response = $this->httpClient()->{$method}($endpoint, $data);

            $this->logResponse($response, $endpoint, $context);

            if ($response->failed()) {
                throw GatewayException::fromResponse(
                    gateway: $this->getConfiguration()->getName(),
                    httpStatusCode: $response->status(),
                    response: $response->json(),
                    paymentUuid: $context,
                );
            }

            return $response;
        } catch (ConnectionException $e) {
            $this->logError($e, $endpoint, $context);

            throw GatewayUnavailableException::connectionFailed(
                gateway: $this->getConfiguration()->getName(),
                paymentUuid: $context,
            );
        } catch (RequestException $e) {
            $this->logError($e, $endpoint, $context);

            if ($e->response) {
                throw GatewayException::fromResponse(
                    gateway: $this->getConfiguration()->getName(),
                    httpStatusCode: $e->response->status(),
                    response: $e->response->json(),
                    paymentUuid: $context,
                );
            }

            throw new GatewayException(
                message: $e->getMessage(),
                previous: $e,
                paymentUuid: $context,
                gateway: $this->getConfiguration()->getName(),
            );
        }
    }

    /**
     * Check if mock responses should be used.
     */
    protected function shouldUseMockResponse(): bool
    {
        return (bool) config('payments.test_mode', false);
    }

    /**
     * Try to resolve a mock response for the given request.
     */
    protected function tryResolveMockResponse(
        string $method,
        string $endpoint,
        array $data,
    ): ?Response {
        $resolver = app(MockResolver::class);
        $gatewayName = $this->getConfiguration()->getName();

        $result = $resolver->resolve($method, $endpoint, $gatewayName, $data);

        if ($result === null) {
            return null;
        }

        return MockResponseFactory::make(
            data: $result['data'],
            status: 200,
            params: $result['params'],
            requestData: $data,
        );
    }

    /**
     * Log a mock response.
     */
    protected function logMockResponse(Response $response, string $endpoint, ?string $context): void
    {
        if (! config('payments.logging.enabled', true)) {
            return;
        }

        $gateway = $this->getConfiguration()->getName();

        Log::channel(config('payments.logging.channel', 'stack'))->debug(
            "[Payment Gateway] [{$gateway}] MOCK Response for {$endpoint}",
            [
                'context' => $context,
                'status' => $response->status(),
                'body' => $response->json(),
                'mock' => true,
            ],
        );
    }

    protected function httpGet(string $endpoint, array $query = [], ?string $context = null): Response
    {
        return $this->request('get', $endpoint, $query, $context);
    }

    protected function httpPost(string $endpoint, array $data = [], ?string $context = null): Response
    {
        return $this->request('post', $endpoint, $data, $context);
    }

    protected function httpPut(string $endpoint, array $data = [], ?string $context = null): Response
    {
        return $this->request('put', $endpoint, $data, $context);
    }

    protected function httpPatch(string $endpoint, array $data = [], ?string $context = null): Response
    {
        return $this->request('patch', $endpoint, $data, $context);
    }

    protected function httpDelete(string $endpoint, array $data = [], ?string $context = null): Response
    {
        return $this->request('delete', $endpoint, $data, $context);
    }

    protected function resetHttpClient(): void
    {
        $this->httpClientInstance = null;
    }
}
