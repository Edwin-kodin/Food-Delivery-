import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <div className="Footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.logo} alt="Company Logo" />
          <p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eum alias
            eos iusto fuga laborum nemo delectus, sunt vero dolores autem
            laudantium distinctio eligendi ut quasi perspiciatis tempora, unde
            possimus labore.
          </p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="Facebook" />
            <img src={assets.twitter_icon} alt="Twitter" />
            <img src={assets.linkedin_icon} alt="LinkedIn" />
          </div>
        </div>

        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About Us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+1-212-456-7890</li>
            <li>contact@yourapp.com</li>
          </ul>
        </div>
      </div>

      <hr />
      <p className="footer-copyright">
        © 2025 Tomato.com. All Rights Reserved.
      </p>
    </div>
  );
};

export default Footer;
