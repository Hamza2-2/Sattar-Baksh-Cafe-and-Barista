import React, { useState } from 'react';
import './Navbar.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSearch, faHeart, faShoppingCart} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../Contexts/UserContext';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useUser();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
    setShowProfileDropdown(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileDropdown(false);
  };

  const handleLoginClick = () => {
    navigate('/login');
    setShowProfileDropdown(false);
  };

  const handleRegisterClick = () => {
    navigate('/register');
    setShowProfileDropdown(false);
  };

  const handleProfileDetailsClick = () => {
    navigate('/profile/personal-details');
    setShowProfileDropdown(false);
  };

  const handlePurchaseHistoryClick = () => {
    navigate('/profile/purchase-history');
    setShowProfileDropdown(false);
  };

  const handlePaymentClick = () => {
    navigate('/profile/payment-credentials');
    setShowProfileDropdown(false);
  };

  const handleWishlistClick = () => {
    navigate('/wishlist');
  };

  return (
    <nav className="navbar">
      <div className="logo">
       <img src={logo} alt="SattarBaksh Cafe" className="logo-image" />
       <h3 className="brand">SattarBaksh</h3>
      </div>
      <ul className="nav-links">
        <li><a href="/">HOME</a></li>
        <li><a href="/shop">SHOP</a></li>
        <li><a href="/contact">CONTACT</a></li>
        <li><a href="/about">ABOUT US</a></li>
      </ul>
    <div className="icons">
      <button>
       <FontAwesomeIcon icon={faSearch} /> 
      </button>
      <div className="profile-dropdown-container">
        <button onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
         <FontAwesomeIcon icon={faUser} /> 
        </button>
        {showProfileDropdown && (
          <div className="profile-dropdown-menu">
            {isLoggedIn ? (
              <>
                <div className="user-name">{user?.firstName} {user?.lastName}</div>
                <button className="dropdown-link" onClick={handleProfileClick}>My Profile</button>
                <button className="dropdown-link" onClick={handleProfileDetailsClick}>Edit Profile</button>
                <button className="dropdown-link" onClick={handlePurchaseHistoryClick}>Purchase History</button>
                <button className="dropdown-link" onClick={handlePaymentClick}>Payment Methods</button>
                <hr />
                <button className="dropdown-link logout-link" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="dropdown-link" onClick={handleLoginClick}>Login</button>
                <button className="dropdown-link" onClick={handleRegisterClick}>Create Account</button>
              </>
            )}
          </div>
        )}
      </div>
      <button onClick={handleWishlistClick}>
       <FontAwesomeIcon icon={faHeart} /> 
      </button>
      <a href="/cart">
        <button>
         <FontAwesomeIcon icon={faShoppingCart} /> 
        </button>
      </a>
    </div>
     
    </nav>
  );
}

export default Navbar;
