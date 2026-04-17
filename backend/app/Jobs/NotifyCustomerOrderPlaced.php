<?php

namespace App\Jobs;

use App\Mail\OrderPlacedMail;
use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Twilio\Rest\Client;

class NotifyCustomerOrderPlaced implements ShouldQueue
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function handle(): void
    {
        $this->order->load(['items.food']);

        Mail::to($this->order->email)->send(new OrderPlacedMail($this->order));

        $this->sendWhatsAppIfConfigured();
    }

    protected function sendWhatsAppIfConfigured(): void
    {
        if (! config('services.twilio.whatsapp_enabled')) {
            return;
        }

        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from = config('services.twilio.whatsapp_from');

        if (! $sid || ! $token || ! $from) {
            Log::warning('Twilio WhatsApp enabled but credentials missing.');

            return;
        }

        $to = $this->normalizeWhatsAppNumber($this->order->phone);
        if (! $to) {
            Log::warning('Could not normalize phone for WhatsApp.', ['phone' => $this->order->phone]);

            return;
        }

        $body = sprintf(
            'Hi %s — your Food Del order #%d is confirmed. Total: $%d. We will be in touch about delivery.',
            $this->order->first_name,
            $this->order->id,
            $this->order->total
        );

        try {
            $client = new Client((string) $sid, (string) $token);
            $client->messages->create($to, [
                'from' => $from,
                'body' => $body,
            ]);
        } catch (\Throwable $e) {
            Log::error('Twilio WhatsApp send failed: '.$e->getMessage());
        }
    }

    protected function normalizeWhatsAppNumber(string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', $phone);
        if ($digits === null || $digits === '') {
            return null;
        }

        if (str_starts_with($digits, '0')) {
            $cc = preg_replace('/\D+/', '', (string) config('services.twilio.default_country_code', '1'));
            $digits = $cc . substr($digits, 1);
        }

        if (strlen($digits) < 10) {
            return null;
        }

        return 'whatsapp:+' . $digits;
    }
}
