<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways\Concerns;

use App\Modules\Payments\Exceptions\GatewayException;
use App\Modules\Payments\Exceptions\GatewayUnavailableException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

trait HasHttpClient
{
    protected function httpClient(): PendingRequest
    {
        $config = $this->getGatewayConfig();

        return Http::baseUrl($this->baseUrl())
            ->timeout($config['timeout'] ?? config('payments.timeout', 30))
            ->retry(
                times: $config['retry_attempts'] ?? config('payments.retry_attempts', 3),
                sleepMilliseconds: $config['retry_delay'] ?? config('payments.retry_delay', 100),
                when: fn ($exception) => $exception instanceof ConnectionException,
                throw: false,
            )
            ->withHeaders($this->defaultHeaders())
            ->acceptJson();
    }

    protected function request(
        string $method,
        string $endpoint,
        array $data = [],
        ?string $paymentUuid = null,
    ): Response {
        $this->logRequest($method, $endpoint, $data, $paymentUuid);

        try {
            $response = $this->httpClient()->$method($endpoint, $data);

            $this->logResponse($response, $endpoint, $paymentUuid);

            if ($response->failed()) {
                throw GatewayException::fromResponse(
                    gateway: $this->name(),
                    httpStatusCode: $response->status(),
                    response: $response->json(),
                    paymentUuid: $paymentUuid,
                );
            }

            return $response;
        } catch (ConnectionException $e) {
            $this->logError($e, $endpoint, $paymentUuid);

            throw GatewayUnavailableException::connectionFailed(
                gateway: $this->name(),
                paymentUuid: $paymentUuid,
            );
        } catch (RequestException $e) {
            $this->logError($e, $endpoint, $paymentUuid);

            if ($e->response) {
                throw GatewayException::fromResponse(
                    gateway: $this->name(),
                    httpStatusCode: $e->response->status(),
                    response: $e->response->json(),
                    paymentUuid: $paymentUuid,
                );
            }

            throw new GatewayException(
                message: $e->getMessage(),
                previous: $e,
                paymentUuid: $paymentUuid,
                gateway: $this->name(),
            );
        }
    }

    protected function get(string $endpoint, array $query = [], ?string $paymentUuid = null): Response
    {
        return $this->request('get', $endpoint, $query, $paymentUuid);
    }

    protected function post(string $endpoint, array $data = [], ?string $paymentUuid = null): Response
    {
        return $this->request('post', $endpoint, $data, $paymentUuid);
    }

    protected function put(string $endpoint, array $data = [], ?string $paymentUuid = null): Response
    {
        return $this->request('put', $endpoint, $data, $paymentUuid);
    }

    protected function delete(string $endpoint, array $data = [], ?string $paymentUuid = null): Response
    {
        return $this->request('delete', $endpoint, $data, $paymentUuid);
    }

    abstract protected function baseUrl(): string;

    abstract protected function defaultHeaders(): array;

    abstract protected function getGatewayConfig(): array;

    abstract public function name(): string;
}
