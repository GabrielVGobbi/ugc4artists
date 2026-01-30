<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Payment Gateway
    |--------------------------------------------------------------------------
    |
    | This option controls the default payment gateway that will be used when
    | processing payments. You may set this to any of the gateways defined
    | in the "gateways" array below.
    |
    */
    'default' => env('PAYMENT_GATEWAY', 'asaas'),

    // Alias for backward compatibility
    'gateway' => env('PAYMENT_GATEWAY', 'asaas'),

    /*
    |--------------------------------------------------------------------------
    | Test Mode
    |--------------------------------------------------------------------------
    |
    | When test mode is enabled, payments will be processed in sandbox/test
    | environment. This should be enabled during development and testing.
    |
    */
    'test_mode' => env('PAYMENT_TEST_MODE', true),

    /*
    |--------------------------------------------------------------------------
    | HTTP Client Settings
    |--------------------------------------------------------------------------
    |
    | These settings control the HTTP client behavior when communicating
    | with payment gateways.
    |
    */
    'timeout' => env('PAYMENT_TIMEOUT', 30),
    'retry_attempts' => env('PAYMENT_RETRY_ATTEMPTS', 3),
    'retry_delay' => env('PAYMENT_RETRY_DELAY', 100),

    /*
    |--------------------------------------------------------------------------
    | Logging Configuration
    |--------------------------------------------------------------------------
    |
    | Configure how payment gateway requests and responses are logged.
    | Set "enabled" to false to disable logging entirely.
    |
    */
    'logging' => [
        'enabled' => env('PAYMENT_LOGGING_ENABLED', true),
        'channel' => env('PAYMENT_LOG_CHANNEL', env('LOG_CHANNEL', 'stack')),
        'level' => env('PAYMENT_LOG_LEVEL', 'debug'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Gateway Configurations
    |--------------------------------------------------------------------------
    |
    | Here you may configure the settings for each payment gateway. Each
    | gateway has its own set of configuration options.
    |
    */
    'gateways' => [
        'asaas' => [
            'enabled' => env('ASAAS_ENABLED', true),
            'api_key' => env('ASAAS_API_KEY'),
            'sandbox' => env('ASAAS_SANDBOX', true),
            'webhook_secret' => env('ASAAS_WEBHOOK_SECRET'),
            'timeout' => env('ASAAS_TIMEOUT', 30),
            'retry' => [
                'attempts' => env('ASAAS_RETRY_ATTEMPTS', 3),
                'delay' => env('ASAAS_RETRY_DELAY', 100),
            ],
            'rate_limit' => [
                'max_attempts' => env('ASAAS_RATE_LIMIT_MAX', 60),
                'decay_seconds' => env('ASAAS_RATE_LIMIT_DECAY', 60),
            ],
            'features' => [
                'customers' => true,
                'payments' => true,
                'subscriptions' => true,
                'transfers' => true,
                'splits' => true,
            ],
            'customer' => [
                'column_external_id' => 'asaas_id',
            ]
        ],

        'iugu' => [
            'enabled' => env('IUGU_ENABLED', true),
            'api_key' => env('IUGU_API_KEY'),
            'account_id' => env('IUGU_ACCOUNT_ID'),
            'webhook_token' => env('IUGU_WEBHOOK_TOKEN'),
            'timeout' => env('IUGU_TIMEOUT', 30),
            'retry' => [
                'attempts' => env('IUGU_RETRY_ATTEMPTS', 3),
                'delay' => env('IUGU_RETRY_DELAY', 100),
            ],
            'rate_limit' => [
                'max_attempts' => env('IUGU_RATE_LIMIT_MAX', 60),
                'decay_seconds' => env('IUGU_RATE_LIMIT_DECAY', 60),
            ],
            'features' => [
                'customers' => true,
                'payments' => true,
                'subscriptions' => true,
                'transfers' => true,
                'splits' => true, // Requires marketplace enabled
            ],
        ],

        // Example for adding a new gateway:
        // 'mercadopago' => [
        //     'enabled' => env('MERCADOPAGO_ENABLED', false),
        //     'access_token' => env('MERCADOPAGO_ACCESS_TOKEN'),
        //     'public_key' => env('MERCADOPAGO_PUBLIC_KEY'),
        //     'webhook_secret' => env('MERCADOPAGO_WEBHOOK_SECRET'),
        //     'sandbox' => env('MERCADOPAGO_SANDBOX', true),
        //     'timeout' => 30,
        //     'retry' => ['attempts' => 3, 'delay' => 100],
        //     'features' => [
        //         'customers' => true,
        //         'payments' => true,
        //         'subscriptions' => true,
        //         'transfers' => false,
        //         'splits' => true,
        //     ],
        // ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Webhook Settings
    |--------------------------------------------------------------------------
    |
    | Configure webhook behavior including tolerance for timestamp validation.
    |
    */
    'webhooks' => [
        'tolerance_seconds' => env('PAYMENT_WEBHOOK_TOLERANCE', 300),
        'queue' => env('PAYMENT_WEBHOOK_QUEUE', 'default'),
        'verify_signature' => env('PAYMENT_WEBHOOK_VERIFY', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Checkout Settings
    |--------------------------------------------------------------------------
    |
    | Default settings for the checkout flow.
    |
    */
    'checkout' => [
        'default_due_days' => env('PAYMENT_DEFAULT_DUE_DAYS', 3),
        'use_wallet_by_default' => env('PAYMENT_USE_WALLET_DEFAULT', true),
        'default_method' => env('PAYMENT_DEFAULT_METHOD', 'pix'),
    ],

    'customer' => [
        'slug' => env('PAYMENT_CUSTOMER_SLUG', ''),
    ],

    /*
    |--------------------------------------------------------------------------
    | Facade Aliases
    |--------------------------------------------------------------------------
    |
    | Register these aliases in config/app.php if you want to use short names.
    |
    | 'Asaas' => App\Modules\Payments\Facades\Asaas::class,
    | 'Iugu' => App\Modules\Payments\Facades\Iugu::class,
    | 'Gateway' => App\Modules\Payments\Facades\Gateway::class,
    | 'Checkout' => App\Modules\Payments\Facades\Checkout::class,
    |
    */
];
