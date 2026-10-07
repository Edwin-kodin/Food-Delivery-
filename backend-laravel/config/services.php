<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'currency' => strtolower((string) env('STRIPE_CURRENCY', 'usd')),
        'amount_multiplier' => (int) env('STRIPE_AMOUNT_MULTIPLIER', 100),
        'automatic_payment_methods' => filter_var(
            env('STRIPE_AUTOMATIC_PAYMENT_METHODS', true),
            FILTER_VALIDATE_BOOL
        ),
        'payment_method_types' => env('STRIPE_PAYMENT_METHOD_TYPES')
            ? json_decode((string) env('STRIPE_PAYMENT_METHOD_TYPES'), true)
            : ['card'],
    ],

    'twilio' => [
        'sid' => env('TWILIO_SID'),
        'token' => env('TWILIO_TOKEN'),
        'whatsapp_from' => env('TWILIO_WHATSAPP_FROM'),
        'whatsapp_enabled' => filter_var(env('TWILIO_WHATSAPP_ENABLED', false), FILTER_VALIDATE_BOOL),
        'default_country_code' => env('TWILIO_DEFAULT_COUNTRY_CODE', '1'),
    ],

];
