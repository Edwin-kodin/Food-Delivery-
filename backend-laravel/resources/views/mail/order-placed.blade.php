<x-mail::message>
# Order #{{ $order->id }}

Hi {{ $order->first_name }},

Thanks for your order. Here is a summary:

<x-mail::panel>
**Total:** ${{ $order->total }}  
**Payment:** {{ strtoupper($order->payment_method) }} — {{ $order->payment_status }}
</x-mail::panel>

**Items**

@foreach ($order->items as $line)
- {{ $line->food->name }} × {{ $line->quantity }} — ${{ $line->line_total }}
@endforeach

**Delivery address**  
{{ $order->street }}, {{ $order->city }}, {{ $order->state }} {{ $order->zip }}

@if($order->instructions)
**Note:** {{ $order->instructions }}
@endif

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
