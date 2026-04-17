import React from "react";
import "./Header.css";
const Header = () => {
  return (
    <div className="header">
      <div className="header-contents">
        <h2>Order your favourite food here</h2>
        <p>
          Choose from a diverse range of delicious dishes and satisfy your
          cravings in just a few clicks. Fast, easy, and delivered to your door!
        </p>

        <button>View Menu</button>
      </div>
    </div>
  );
};

export default Header;
