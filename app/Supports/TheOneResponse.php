<?php

namespace App\Supports;

use Illuminate\Contracts\Support\Responsable;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TheOneResponse implements Responsable
{
    protected int $httpCode;
    protected array $data;
    protected string $errorMessage;
    protected ?string $inertiaView;
    protected ?string $redirectRoute;

    public function __construct(
        int $httpCode,
        array $data = [],
        string $errorMessage = '',
        ?string $inertiaView = null,
        ?string $redirectRoute = null
    ) {
        $this->httpCode = $httpCode;
        $this->data = $data;
        $this->errorMessage = $errorMessage;
        $this->inertiaView = $inertiaView;
        $this->redirectRoute = $redirectRoute;
    }

    public function toResponse($request): Response
    {
        /** @var Request $request */

        if ($request->expectsJson()) {
            return $this->toJsonResponse();
        }

        if ($this->inertiaView) {
            return $this->toInertiaResponse($request);
        }

        if ($this->redirectRoute) {
            return $this->toRedirectResponse();
        }

        return $this->toJsonResponse();
    }

    protected function toJsonResponse(): JsonResponse
    {
        $payload = match (true) {
            $this->httpCode >= 500 => ['message' => 'Server error'],
            $this->httpCode >= 400 => ['message' => $this->errorMessage],
            default               => $this->data,
        };

        return response()->json(
            data: $payload,
            status: $this->httpCode,
            options: JSON_UNESCAPED_UNICODE
        );
    }

    protected function toInertiaResponse(Request $request): Response
    {
        return Inertia::render($this->inertiaView, $this->data)
            ->toResponse($request);
    }

    protected function toRedirectResponse(): RedirectResponse
    {
        $redirect = redirect()->route($this->redirectRoute);

        if (isset($this->data['message'])) {
            $redirect->with('message', $this->data['message']);
        }

        return $redirect;
    }

    public static function ok(array $data, ?string $inertiaView = null, ?string $redirectRoute = null): self
    {
        return new static(200, $data, inertiaView: $inertiaView, redirectRoute: $redirectRoute);
    }

    public static function created(array $data, ?string $inertiaView = null, ?string $redirectRoute = null): self
    {
        return new static(201, $data, inertiaView: $inertiaView, redirectRoute: $redirectRoute);
    }

    public static function notFound(string $errorMessage = "Record not found", ?string $redirectRoute = null): self
    {
        return new static(404, errorMessage: $errorMessage, redirectRoute: $redirectRoute);
    }

    public static function unprocessable(string $errorMessage = "Resource Invalid", ?string $redirectRoute = null): self
    {
        return new static(422, errorMessage: $errorMessage, redirectRoute: $redirectRoute);
    }
}
