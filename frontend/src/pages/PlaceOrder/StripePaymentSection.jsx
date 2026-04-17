import React, { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

function InnerPay({ onSuccess, onError, disabled }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    setBusy(false);
    if (error) {
      onError(error.message || "Payment failed.");
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="place-order-stripe-form">
      <PaymentElement />
      <button
        type="submit"
        className="place-order-submit"
        disabled={disabled || busy || !stripe}
      >
        {busy ? "Processing…" : "Pay now"}
      </button>
    </form>
  );
}

export default function StripePaymentSection({
  publishableKey,
  clientSecret,
  onSuccess,
  onError,
  disabled,
}) {
  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey]
  );

  if (!stripePromise || !clientSecret) {
    return (
      <p className="place-order-error">Payment could not be initialized.</p>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <InnerPay
        onSuccess={onSuccess}
        onError={onError}
        disabled={disabled}
      />
    </Elements>
  );
}
