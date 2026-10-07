<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\NotifyCustomerOrderPlaced;
use App\Models\Food;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\StripePaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;

class OrderController extends Controller
{
    public function store(Request $request, StripePaymentService $stripe): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:120'],
            'last_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:40'],
            'street' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:120'],
            'state' => ['required', 'string', 'max:120'],
            'zip' => ['required', 'string', 'max:32'],
            'instructions' => ['nullable', 'string', 'max:2000'],
            'payment_method' => ['required', 'string', 'in:cod,card,mobile_money'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.food_id' => ['required', 'integer', 'exists:foods,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $online = in_array($validated['payment_method'], ['card', 'mobile_money'], true);
        if ($online && empty(config('services.stripe.secret'))) {
            return response()->json([
                'message' => 'Online payment is not configured. Set STRIPE_SECRET in the backend .env file.',
            ], 503);
        }

        $deliveryFee = (int) config('food.delivery_fee', 2);

        $userId = null;
        if ($bearer = $request->bearerToken()) {
            $accessToken = PersonalAccessToken::findToken($bearer);
            if ($accessToken?->tokenable instanceof User) {
                $userId = $accessToken->tokenable->id;
            }
        }

        $order = DB::transaction(function () use ($validated, $deliveryFee, $userId, $online) {
            $subtotal = 0;
            $lines = [];

            foreach ($validated['items'] as $line) {
                $food = Food::query()->findOrFail($line['food_id']);
                $qty = $line['quantity'];
                $lineTotal = $food->price * $qty;
                $subtotal += $lineTotal;
                $lines[] = [
                    'food' => $food,
                    'quantity' => $qty,
                    'line_total' => $lineTotal,
                ];
            }

            $delivery = $subtotal > 0 ? $deliveryFee : 0;
            $total = $subtotal + $delivery;

            $paymentStatus = $online ? 'awaiting_payment' : 'cod';

            $order = Order::query()->create([
                'user_id' => $userId,
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'street' => $validated['street'],
                'city' => $validated['city'],
                'state' => $validated['state'],
                'zip' => $validated['zip'],
                'instructions' => $validated['instructions'] ?? null,
                'payment_method' => $validated['payment_method'],
                'subtotal' => $subtotal,
                'delivery_fee' => $delivery,
                'total' => $total,
                'status' => 'pending',
                'payment_status' => $paymentStatus,
            ]);

            foreach ($lines as $row) {
                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'food_id' => $row['food']->id,
                    'quantity' => $row['quantity'],
                    'unit_price' => $row['food']->price,
                    'line_total' => $row['line_total'],
                ]);
            }

            return $order;
        });

        $stripePayload = null;
        if ($online) {
            $intent = $stripe->createIntentForOrder($order);
            $order->forceFill(['stripe_payment_intent_id' => $intent->id])->save();
            $stripePayload = [
                'publishable_key' => (string) config('services.stripe.key'),
                'client_secret' => $intent->client_secret,
            ];
        } else {
            NotifyCustomerOrderPlaced::dispatch($order);
        }

        return response()->json([
            'message' => 'Order placed successfully.',
            'order' => [
                'id' => $order->id,
                'total' => $order->total,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
            ],
            'stripe' => $stripePayload,
        ], 201);
    }
}
