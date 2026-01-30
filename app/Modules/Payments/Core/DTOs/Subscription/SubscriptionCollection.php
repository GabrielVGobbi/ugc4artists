<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Subscription;

use ArrayIterator;
use Countable;
use IteratorAggregate;
use Traversable;

/**
 * Collection of subscription responses with pagination info.
 *
 * @implements IteratorAggregate<int, SubscriptionResponse>
 */
readonly class SubscriptionCollection implements Countable, IteratorAggregate
{
    /**
     * @param SubscriptionResponse[] $items
     */
    public function __construct(
        public array $items,
        public int $total = 0,
        public int $perPage = 10,
        public int $currentPage = 1,
        public bool $hasMore = false,
    ) {}

    public static function fromArray(array $data, string $provider = ''): self
    {
        $items = array_map(
            fn (array $item) => SubscriptionResponse::fromArray($item, $provider),
            $data['data'] ?? $data['items'] ?? $data
        );

        return new self(
            items: $items,
            total: $data['totalCount'] ?? $data['total'] ?? count($items),
            perPage: $data['limit'] ?? $data['per_page'] ?? 10,
            currentPage: $data['offset'] ?? $data['current_page'] ?? 1,
            hasMore: $data['hasMore'] ?? $data['has_more'] ?? false,
        );
    }

    public function count(): int
    {
        return count($this->items);
    }

    public function getIterator(): Traversable
    {
        return new ArrayIterator($this->items);
    }

    public function isEmpty(): bool
    {
        return $this->count() === 0;
    }

    public function first(): ?SubscriptionResponse
    {
        return $this->items[0] ?? null;
    }

    public function toArray(): array
    {
        return [
            'items' => array_map(fn (SubscriptionResponse $item) => $item->toArray(), $this->items),
            'total' => $this->total,
            'per_page' => $this->perPage,
            'current_page' => $this->currentPage,
            'has_more' => $this->hasMore,
        ];
    }
}
