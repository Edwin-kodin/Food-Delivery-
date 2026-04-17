import React, { useContext, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import "./PlaceOrder.css";
import { DELIVERY_FEE, StoreContext } from "../../context/StoreContext";
import { apiFetch } from "../../api/client";
import StripePaymentSection from "./StripePaymentSection";

const PlaceOrder = () => {
  const { cartItems, food_list, getTotalCartAmount, clearCart } =
    useContext(StoreContext);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [payment, setPayment] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [stripeStep, setStripeStep] = useState(null);
  const [confirmedPayment, setConfirmedPayment] = useState(null);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    instructions: "",
  });

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const onChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const finishSuccess = (id, paymentKind) => {
    setOrderId(id);
    setConfirmedPayment(paymentKind);
    setOrderPlaced(true);
    setStripeStep(null);
    clearCart();
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const items = Object.entries(cartItems)
      .filter(([, qty]) => qty > 0)
      .map(([id, quantity]) => ({
        food_id: parseInt(id, 10),
        quantity,
      }));

    setSubmitting(true);
    try {
      const json = await apiFetch("/orders", {
        method: "POST",
        body: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          street: data.street,
          city: data.city,
          state: data.state,
          zip: data.zip,
          instructions: data.instructions || null,
          payment_method: payment,
          items,
        },
      });

      const id = json.order?.id ?? null;

      if (json.stripe?.client_secret && json.stripe?.publishable_key) {
        setStripeStep({
          orderId: id,
          clientSecret: json.stripe.client_secret,
          publishableKey: json.stripe.publishable_key,
        });
      } else {
        finishSuccess(id, "cod");
      }
    } catch (err) {
      setSubmitError(err.message || "Could not place order.");
    } finally {
      setSubmitting(false);
    }
  };

  const paymentNote = () => {
    if (confirmedPayment === "stripe") {
      return "Payment received. You will get a confirmation email when the server processes the webhook.";
    }
    if (confirmedPayment === "cod" || payment === "cod") {
      return "Pay with cash when your order arrives.";
    }
    if (payment === "mobile_money") {
      return "Complete payment with mobile money or card via Stripe (region-dependent).";
    }
    return "Complete card payment securely via Stripe.";
  };

  if (orderPlaced) {
    return (
      <div className="place-order place-order-success">
        <div className="place-order-success-card">
          <h2>Order received</h2>
          {orderId ? (
            <p className="place-order-order-id">Order #{orderId}</p>
          ) : null}
          <p>
            Thank you{data.firstName ? `, ${data.firstName}` : ""}. We will
            confirm your order by email shortly.
          </p>
          <p className="place-order-success-note">{paymentNote()}</p>
          <Link to="/" className="place-order-success-cta">
            Back to menu
          </Link>
        </div>
      </div>
    );
  }

  if (subtotal <= 0) {
    return <Navigate to="/cart" replace />;
  }

  if (stripeStep) {
    return (
      <div className="place-order place-order-pay">
        <div className="place-order-left">
          <h2>Complete payment</h2>
          <p className="place-order-pay-intro">
            Order #{stripeStep.orderId} — total{" "}
            <strong>${total}</strong>. Use the secure form below.
          </p>
          {submitError ? (
            <p className="place-order-error">{submitError}</p>
          ) : null}
          <StripePaymentSection
            publishableKey={stripeStep.publishableKey}
            clientSecret={stripeStep.clientSecret}
            onSuccess={() => finishSuccess(stripeStep.orderId, "stripe")}
            onError={(msg) => setSubmitError(msg)}
            disabled={submitting}
          />
          <button
            type="button"
            className="place-order-cancel-pay"
            onClick={() => {
              setStripeStep(null);
              setSubmitError(
                "Payment cancelled. Your order may still be pending — contact support with your order number."
              );
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="place-order">
      <form className="place-order-form" onSubmit={handleSubmit}>
        <div className="place-order-left">
          <h2>Delivery details</h2>
          {submitError ? (
            <p className="place-order-error">{submitError}</p>
          ) : null}
          <div className="place-order-row">
            <input
              name="firstName"
              value={data.firstName}
              onChange={onChange}
              placeholder="First name"
              required
            />
            <input
              name="lastName"
              value={data.lastName}
              onChange={onChange}
              placeholder="Last name"
              required
            />
          </div>
          <input
            name="email"
            type="email"
            value={data.email}
            onChange={onChange}
            placeholder="Email address"
            required
          />
          <input
            name="phone"
            type="tel"
            value={data.phone}
            onChange={onChange}
            placeholder="Phone number"
            required
          />
          <input
            name="street"
            value={data.street}
            onChange={onChange}
            placeholder="Street address"
            required
          />
          <div className="place-order-row place-order-row-3">
            <input
              name="city"
              value={data.city}
              onChange={onChange}
              placeholder="City"
              required
            />
            <input
              name="state"
              value={data.state}
              onChange={onChange}
              placeholder="State / Region"
              required
            />
            <input
              name="zip"
              value={data.zip}
              onChange={onChange}
              placeholder="ZIP / Postal code"
              required
            />
          </div>
          <textarea
            name="instructions"
            value={data.instructions}
            onChange={onChange}
            placeholder="Delivery instructions (optional)"
            rows={3}
          />
          <div className="place-order-payment">
            <h3>Payment</h3>
            <label className="place-order-radio">
              <input
                type="radio"
                name="payment"
                checked={payment === "cod"}
                onChange={() => setPayment("cod")}
              />
              Cash on delivery
            </label>
            <label className="place-order-radio">
              <input
                type="radio"
                name="payment"
                checked={payment === "card"}
                onChange={() => setPayment("card")}
              />
              Card (Stripe)
            </label>
            <label className="place-order-radio place-order-radio-muted">
              <input
                type="radio"
                name="payment"
                checked={payment === "mobile_money"}
                onChange={() => setPayment("mobile_money")}
              />
              Mobile money / wallets (Stripe — enable in Dashboard and .env)
            </label>
          </div>
          <button
            type="submit"
            className="place-order-submit"
            disabled={submitting}
          >
            {submitting ? "Placing order…" : `Place order — $${total}`}
          </button>
        </div>
      </form>
      <div className="place-order-right">
        <h2>Order summary</h2>
        <div className="place-order-items">
          {food_list.map((item) => {
            const qty = cartItems[item._id];
            if (!qty) return null;
            return (
              <div key={item._id} className="place-order-line">
                <span>
                  {item.name} × {qty}
                </span>
                <span>${item.price * qty}</span>
              </div>
            );
          })}
        </div>
        <hr />
        <div className="place-order-line">
          <span>Subtotal</span>
          <span>${subtotal}</span>
        </div>
        <div className="place-order-line">
          <span>Delivery</span>
          <span>${deliveryFee}</span>
        </div>
        <hr />
        <div className="place-order-line place-order-total">
          <span>Total</span>
          <span>${total}</span>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
