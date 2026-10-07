<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\NotifyCustomerOrderPlaced;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Event as StripeEvent;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $payload = $request->getContent();
        $sig = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        if (! is_string($secret) || $secret === '') {
            return response('Webhook not configured', 500);
        }

        try {
            $event = Webhook::constructEvent($payload, (string) $sig, $secret);
        } catch (SignatureVerificationException|\UnexpectedValueException) {
            return response('Invalid signature', 400);
        }

        if ($event->type === 'payment_intent.succeeded') {
            $this->handlePaymentSucceeded($event);
        }

        if ($event->type === 'payment_intent.payment_failed') {
            $this->handlePaymentFailed($event);
        }

        return response('OK', 200);
    }

    protected function handlePaymentSucceeded(StripeEvent $event): void
    {
        $intent = $event->data->object;
        $orderId = $intent->metadata->order_id ?? null;

        if (! $orderId) {
            return;
        }

        $order = Order::query()->find((int) $orderId);
        if (! $order) {
            return;
        }

        if ($order->payment_status === 'paid') {
            return;
        }

        $order->forceFill([
            'payment_status' => 'paid',
            'stripe_payment_intent_id' => $intent->id,
        ])->save();

        NotifyCustomerOrderPlaced::dispatch($order);
    }

    protected function handlePaymentFailed(StripeEvent $event): void
    {
        $intent = $event->data->object;
        $orderId = $intent->metadata->order_id ?? null;

        if (! $orderId) {
            return;
        }

        Order::query()->whereKey((int) $orderId)->update([
            'payment_status' => 'failed',
            'stripe_payment_intent_id' => $intent->id,
        ]);
    }
}
