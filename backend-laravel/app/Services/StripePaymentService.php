<?php

namespace App\Services;

use App\Models\Order;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class StripePaymentService
{
    public function __construct()
    {
        Stripe::setApiKey((string) config('services.stripe.secret'));
    }

    /**
     * @throws ApiErrorException
     */
    public function createIntentForOrder(Order $order): PaymentIntent
    {
        $currency = (string) config('services.stripe.currency', 'usd');
        $multiplier = (int) config('services.stripe.amount_multiplier', 100);
        $amount = (int) round($order->total * $multiplier);

        $params = [
            'amount' => $amount,
            'currency' => $currency,
            'metadata' => [
                'order_id' => (string) $order->id,
            ],
        ];

        if (config('services.stripe.automatic_payment_methods')) {
            $params['automatic_payment_methods'] = ['enabled' => true];
        } else {
            $types = config('services.stripe.payment_method_types', ['card']);
            $params['payment_method_types'] = is_array($types) ? $types : ['card'];
        }

        return PaymentIntent::create($params);
    }
}
