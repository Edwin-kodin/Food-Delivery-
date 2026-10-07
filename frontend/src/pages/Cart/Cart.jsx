import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import "./Cart.css";
import { DELIVERY_FEE, StoreContext } from "../../context/StoreContext";

const Cart = () => {
  const {
    cartItems,
    food_list,
    foodsLoading,
    foodsError,
    removeFromCart,
    getTotalCartAmount,
    getCartItemCount,
  } = useContext(StoreContext);

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;
  const storedCount = getCartItemCount();

  const cartLines = useMemo(
    () =>
      food_list.filter((item) => (cartItems[item.id] || 0) > 0),
    [food_list, cartItems]
  );

  if (foodsLoading && storedCount > 0) {
    return (
      <div className="cart cart-empty">
        <h2>Loading your cart…</h2>
        <p>Fetching menu prices from the server.</p>
      </div>
    );
  }

  if (foodsError && storedCount > 0 && cartLines.length === 0) {
    return (
      <div className="cart cart-empty">
        <h2>Cannot load menu</h2>
        <p>{foodsError}</p>
        <p className="cart-retry-hint">
          Ensure the API is running, then refresh the page.
        </p>
      </div>
    );
  }

  if (cartLines.length === 0) {
    return (
      <div className="cart cart-empty">
        <h2>Your cart is empty</h2>
        <p>Add something delicious from the menu to get started.</p>
        <Link to="/" className="cart-empty-cta">
          Browse menu
        </Link>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {cartLines.map((item) => {
          const imageUrl = item.image.startsWith('http') ? item.image : `http://localhost:4000/images/${item.image}`;
          return (
          <div key={item.id}>
            <div className="cart-items-title cart-items-item">
              <img src={imageUrl} alt="" />
              <p>{item.name}</p>
              <p>${item.price}</p>
              <p>{cartItems[item.id]}</p>
              <p>${item.price * cartItems[item.id]}</p>
              <p
                onClick={() => removeFromCart(item.id)}
                className="cross"
              >
                x
              </p>
            </div>
            <hr />
          </div>
        )})}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart total</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${subtotal}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery fee</p>
              <p>${deliveryFee}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${total}</b>
            </div>
          </div>
          <Link to="/order">
            <button type="button">PROCEED TO CHECKOUT</button>
          </Link>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="Promo code" />
              <button type="button">Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
