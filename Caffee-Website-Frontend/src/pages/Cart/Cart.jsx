import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Cart.css';
import defaultProductImage from '../../assets/product1.png';
import { useCart } from '../../components/Contexts/CartContext';

const CartDetails = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotals, applyVoucher, removeVoucher } = useCart();
  const { itemCount, subtotal, discount, total, appliedVoucher } = getCartTotals();
  
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherMessage, setVoucherMessage] = useState('');
  const [isVoucherError, setIsVoucherError] = useState(false);

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      setVoucherMessage('Please enter a voucher code');
      setIsVoucherError(true);
      return;
    }

    const result = applyVoucher(voucherCode);
    setVoucherMessage(result.message);
    setIsVoucherError(!result.success);
    
    if (result.success) {
      setVoucherCode('');
    }
  };

 
  const handleRemoveVoucher = () => {
    removeVoucher();
    setVoucherMessage('');
    setIsVoucherError(false);
  };
 
  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added any products to your cart yet.</p>
        <Link to="/shop" className="continue-shopping">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-left">
        <h2>Your Cart ({itemCount})</h2>
        
        {cartItems.map(item => (
          <div className="cart-item" key={item.id}>
            <img 
              src={item.image_url || item.image || defaultProductImage} 
              alt={item.name}
              onError={(e) => (e.target.src = defaultProductImage)}
            />
            <div className="item-details">
              <p className="title">{item.name}</p>
              <p><strong>PKR {item.price}</strong></p>
              {item.size && <p>Size: <strong>{item.size}</strong></p>}
              <p className="in-stock">In Stock</p>
              <div className="actions">
                <Link to={`/product/${item.id}`}>
                  <button>Edit</button>
                </Link>
                <button>Move To Wishlist</button>
              </div>
            </div>
            <div className="qty-controls">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
            </div>
            <button 
              className="trash-btn"
              onClick={() => removeFromCart(item.id)}
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      <div className="cart-right">
        <div className="voucher-box">
          <h3>REDEEM YOUR VOUCHER</h3>
          {!appliedVoucher ? (
            <>
              <input 
                type="text" 
                placeholder="Enter Code" 
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyVoucher()}
              />
              <button onClick={handleApplyVoucher}>APPLY</button>
            </>
          ) : (
            <div className="applied-voucher">
              <button onClick={handleRemoveVoucher} style={{ backgroundColor: '#ff4444' }}>
                REMOVE
              </button>
            </div>
          )}
          {voucherMessage && (
            <p style={{ 
              color: isVoucherError ? 'red' : 'green', 
              fontSize: '14px', 
              marginTop: '10px' 
            }}>
              {voucherMessage}
            </p>
          )}
        </div>
        
        <div className="order-summary">
          <h3>ORDER SUMMARY</h3>
          <div className="summary-item">
            <span>Subtotal</span>
            <span>PKR {subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="summary-item" style={{ color: 'green' }}>
              <span>Discount ({appliedVoucher.code})</span>
              <span>- PKR {discount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-total">
            <strong>Total</strong>
            <strong>PKR {total.toFixed(2)}</strong>
          </div>
          <a href="/checkout">
            <button className="checkout-btn">PROCEED TO CHECKOUT</button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default CartDetails;