import { useState } from "react";
import { ArrowRight, Twitter, Instagram, Linkedin } from "lucide-react";
import "./Footer.css";
import logo from "../../assets/logo.png";

export default function Footer() {
  const [email, setEmail] = useState("");
  
  const handleSubmit = () => {
    console.log("Subscribing email:", email);
    setEmail("");
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="brand-header">
            <img src={logo} alt="SattarBaksh Cafe" className="footer-logo" />
            <h2 className="brand-name">SattarBaksh</h2>
          </div>
          <p className="tagline">
            Premium quality coffee for the coffee enthusiasts. Experience the finest brews crafted with passion and dedication.
          </p>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">ABOUT</h3>
          <ul className="footer-links">
            <li><a href="/about">About us</a></li>
            <li><a href="/shop">Shop</a></li>
            <li><a href="#">Account</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">FOLLOW US ON</h3>
          <ul className="footer-links">
            <li>
              <a href="#" className="social-link">
                <Twitter size={16} className="icon" />
                Twitter
              </a>
            </li>
            <li>
              <a href="#" className="social-link">
                <Instagram size={16} className="icon" />
                Instagram
              </a>
            </li>
            <li>
              <a href="#" className="social-link">
                <Linkedin size={16} className="icon" />
                Linkedin
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h2 className="newsletter-heading">Subscribe.</h2>
          <p className="newsletter-text">
            Subscribe to our newsletter to receive exclusive offers and updates.
          </p>
          <div className="subscription-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address."
              className="email-input"
            />
            <button
              onClick={handleSubmit}
              className="submit-button"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}