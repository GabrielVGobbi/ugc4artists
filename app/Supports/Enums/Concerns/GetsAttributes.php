<?php

namespace App\Supports\Enums\Concerns;

use Illuminate\Support\Str;
use ReflectionClassConstant;
use App\Supports\Enums\Attributes\Description;
use Illuminate\Support\Collection;

trait GetsAttributes
{
    /**
     * @param self $enum
     */
    private static function getDescription(self $enum): string
    {
        $ref = new ReflectionClassConstant(self::class, $enum->name);

        $classAttributes = $ref->getAttributes(Description::class);

        if (count($classAttributes) === 0) {
            return Str::headline($enum->value);
        }

        return $classAttributes[0]->newInstance()->description;
    }

    /**
     * @return array<string,string>
     */
    public static function asSelectArray(): Collection
    {
        /** @var array<string,string> $values */
        $values = collect(self::cases())
            ->map(function ($enum) {
                return [
                    'name' => self::getDescription($enum),
                    'value' => $enum->value,
                    'translate' => $this->getLabelTextByLabel($enum->value),
                ];
            });

        return collect($values);
    }

    /**
     * @return Collection
     */
    public static function options(): Collection
    {
        $cases   = static::cases();
        $options = [];
        foreach ($cases as $case) {
            $label = $case->name;
            if (Str::contains($label, '_')) {
                $label = Str::replace('_', ' ', $label);
            }
            $options[] = [
                'case' => $case->name,
                'value' => $case->value,
                'label' => Str::title($label),
                'label_translate' => static::getLabelTextByLabel($case->value),
                'icon'  => method_exists($case, 'getIcon') ? $case->getIcon() : null,
            ];
        }

        return collect($options);
    }


    public function getLabelHTML()
    {
        return sprintf(
            '<span class="badge rounded-pill bg-%s">%s</span>',
            $this->getLabelColor(),
            __trans($this->getLabelText())
        );
    }

    public function getBadgeHTML()
    {
        return sprintf(
            '<span class="badge badge-phoenix fs-10 badge-phoenix-%s">
                %s
                <i class="%s mx-1"></i>
            </span>',
            $this->getLabelColor(),
            __trans($this->getLabelText()),
            $this->getIcon(),
        );
    }

    public function getLabelClasses(): string
    {
        return match ($this->getLabelColor()) {
            'info'    => 'bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 border',
            'success' => 'bg-green-700 text-white hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 border',
            'danger'  => 'bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border',
            'warning' => 'bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 dark:bg-yellow-500/10 dark:text-yellow-400 dark:hover:bg-yellow-500/20 border',
            default => 'bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 dark:bg-gray-500/10 dark:text-gray-400 dark:hover:bg-gray-500/20 border',
        };
    }

    public function toPresenterArray(): array
    {
        return [
            'value' => $this->value,
            'label' => method_exists($this, 'getLabelText') ? $this->getLabelText() : $this->name,
            'color' => method_exists($this, 'getLabelColor') ? $this->getLabelColor() : 'gray',
            'icon'  => method_exists($this, 'getIcon') ? $this->getIcon() : null,
            'classes'  => method_exists($this, 'getLabelClasses') ? $this->getLabelClasses() : 'bg-blue-800 text-white',
        ];
    }
}
