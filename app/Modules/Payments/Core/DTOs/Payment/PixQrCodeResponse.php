<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Payment;

use DateTimeImmutable;

/**
 * DTO for PIX QR code response.
 */
readonly class PixQrCodeResponse
{
    public function __construct(
        public string $payload,
        public ?string $encodedImage = null,
        public ?DateTimeImmutable $expiresAt = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            payload: $data['payload'] ?? $data['qrcode'] ?? $data['qr_code'] ?? '',
            encodedImage: $data['encodedImage'] ?? $data['encoded_image'] ?? $data['qrcode_image'] ?? null,
            expiresAt: isset($data['expirationDate']) || isset($data['expires_at'])
                ? new DateTimeImmutable($data['expirationDate'] ?? $data['expires_at'])
                : null,
        );
    }

    public function toArray(): array
    {
        return [
            'payload' => $this->payload,
            'encoded_image' => $this->encodedImage,
            'expires_at' => $this->expiresAt?->format('Y-m-d H:i:s'),
        ];
    }
}
