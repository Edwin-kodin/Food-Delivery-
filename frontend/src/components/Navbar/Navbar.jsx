import React, { useContext, useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("Home");
  const { getCartItemCount } = useContext(StoreContext);
  const { user, logout, ready } = useAuth();
  const cartCount = getCartItemCount();

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} className="logo" alt="Food Del" />
      </Link>
      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("Home")}
          className={menu === "Home" ? "active" : ""}
        >
          Home
        </Link>
        <a
          href="#explore-menu"
          onClick={() => setMenu("Menu")}
          className={menu === "Menu" ? "active" : ""}
        >
          Menu
        </a>
        <a
          href="#app-download"
          onClick={() => setMenu("Mobile-App")}
          className={menu === "Mobile-App" ? "active" : ""}
        >
          Mobile-App
        </a>
        <a
          href="#footer"
          onClick={() => setMenu("Contact-Us")}
          className={menu === "Contact-Us" ? "active" : ""}
        >
          Contact-Us
        </a>
      </ul>
      <div className="navbar-right">
        <img src={assets.search_icon} alt="" />
        <div className="navbar-search-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="" />
          </Link>
          {cartCount > 0 ? (
            <div className="dot" title={`${cartCount} items in cart`} />
          ) : null}
        </div>
        {ready && user ? (
          <div className="navbar-user">
            <span className="navbar-user-name" title={user.email}>
              Hi, {user.name.split(" ")[0]}
            </span>
            <button type="button" onClick={() => logout()}>
              Log out
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setShowLogin(true)}>
            Sign in
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
