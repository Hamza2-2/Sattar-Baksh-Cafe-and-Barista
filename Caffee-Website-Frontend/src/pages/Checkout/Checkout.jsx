import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';
 
const CartContext = React.createContext(null);
const CheckoutContext = React.createContext(null);
 

export default function CheckoutPage() {
  const navigate = useNavigate();
   
  const [localCart, setLocalCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    mobile: '',
    address: '',
    country: 'Pakistan',
    region: 'Islamabad Capital Territory',
    city: 'Islamabad',
    postalCode: '',
    shippingMethod: 'Standard',
    paymentMethod: 'COD'
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openSections, setOpenSections] = useState({
    email: true,
    shipping: true,
    payment: true
  });

 
  const subtotal = localCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = formData.shippingMethod === 'Free' ? 0 : 220;
  const total = subtotal + shipping;

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (formErrors[id]) {
      setFormErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.mobile.trim()) errors.mobile = 'Mobile number is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.postalCode.trim()) errors.postalCode = 'Postal code is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitError('');
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    if (localCart.length === 0) {
      setSubmitError('Your cart is empty. Please add items before checkout.');
      return;
    }
    
    setIsLoading(true);
    
    try {
 
      const orderNumber = '#ORD-' + Math.floor(10000 + Math.random() * 90000);
       
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 7);
      const estimatedDelivery = deliveryDate.toISOString().split('T')[0];
 
      const orderData = {
        customer: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.mobile,
          address: `${formData.address}, ${formData.city}, ${formData.country}`,
        },
        order: {
          order_number: orderNumber,
          subtotal: subtotal,
          shipping_cost: shipping,
          total_amount: total,
          payment_method: formData.paymentMethod,
          status: 'Processing',
          estimated_delivery: estimatedDelivery,
          shipping_method: formData.shippingMethod,
          delivery_address: formData.address,
          delivery_city: formData.city,
          delivery_postal_code: formData.postalCode,
          delivery_phone: formData.mobile,
        },
        items: localCart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
        }))
      };

    
      const response = await fetch('http://localhost:5000/orders/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to place order');
      }
 
      const confirmationData = {
        orderNumber: orderNumber,
        customer: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.mobile,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        items: localCart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totals: {
          subtotal: subtotal,
          shipping: shipping,
          total: total
        },
        estimatedDelivery: estimatedDelivery
      };
      localStorage.setItem('lastOrder', JSON.stringify(confirmationData));

  
      localStorage.removeItem('cart');
      setLocalCart([]);
      
    
      navigate('/order-confirmed');
      
    } catch (error) {
      console.error('Order failed:', error);
      setSubmitError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto', padding: '20px', gap: '30px' }}>
      {isLoading && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ fontSize: '18px' }}>Processing your order...</div>
        </div>
      )}
 
      <form onSubmit={handleSubmit} style={{ flex: '1 1 500px', minWidth: '300px' }}>
        {submitError && (
          <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px 16px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ffcdd2' }}>
            {submitError}
          </div>
        )}
        
 
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '16px', overflow: 'hidden' }}>
          <div onClick={() => toggleSection('email')} style={{ padding: '16px', backgroundColor: '#f5f5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1b5e20', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</span>
            <h3 style={{ margin: 0 }}>ENTER EMAIL</h3>
          </div>
          {openSections.email && (
            <div style={{ padding: '16px' }}>
              <input 
                type="email" 
                id="email" 
                placeholder="Email *" 
                value={formData.email} 
                onChange={handleInputChange}
                style={{ width: '100%', padding: '12px', border: `1px solid ${formErrors.email ? '#c62828' : '#ddd'}`, borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
              />
              {formErrors.email && <span style={{ color: '#c62828', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.email}</span>}
            </div>
          )}
        </div>

    
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '16px', overflow: 'hidden' }}>
          <div onClick={() => toggleSection('shipping')} style={{ padding: '16px', backgroundColor: '#f5f5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1b5e20', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</span>
            <h3 style={{ margin: 0 }}>DELIVERY ADDRESS</h3>
          </div>
          {openSections.shipping && (
            <div style={{ padding: '16px' }}>
              <h4 style={{ marginTop: 0, marginBottom: '12px', color: '#666' }}>Customer Details</h4>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <input type="text" id="firstName" placeholder="First Name *" value={formData.firstName} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: `1px solid ${formErrors.firstName ? '#c62828' : '#ddd'}`, borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                  {formErrors.firstName && <span style={{ color: '#c62828', fontSize: '12px' }}>{formErrors.firstName}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <input type="text" id="lastName" placeholder="Last Name *" value={formData.lastName} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: `1px solid ${formErrors.lastName ? '#c62828' : '#ddd'}`, borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                  {formErrors.lastName && <span style={{ color: '#c62828', fontSize: '12px' }}>{formErrors.lastName}</span>}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <input type="tel" id="mobile" placeholder="Mobile Number *" value={formData.mobile} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: `1px solid ${formErrors.mobile ? '#c62828' : '#ddd'}`, borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                {formErrors.mobile && <span style={{ color: '#c62828', fontSize: '12px' }}>{formErrors.mobile}</span>}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <input type="text" id="address" placeholder="Street Address / House Number *" value={formData.address} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: `1px solid ${formErrors.address ? '#c62828' : '#ddd'}`, borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                {formErrors.address && <span style={{ color: '#c62828', fontSize: '12px' }}>{formErrors.address}</span>}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <select id="country" value={formData.country} onChange={handleInputChange} style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}>
                  <option value="Pakistan">Pakistan</option>
                </select>
                <select id="region" value={formData.region} onChange={handleInputChange} style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}>
                  <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="KPK">KPK</option>
                  <option value="Balochistan">Balochistan</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <select id="city" value={formData.city} onChange={handleInputChange} style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Quetta">Quetta</option>
                </select>
                <div style={{ flex: 1 }}>
                  <input type="text" id="postalCode" placeholder="Postal Code *" value={formData.postalCode} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: `1px solid ${formErrors.postalCode ? '#c62828' : '#ddd'}`, borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                  {formErrors.postalCode && <span style={{ color: '#c62828', fontSize: '12px' }}>{formErrors.postalCode}</span>}
                </div>
              </div>

              <h4 style={{ marginTop: '20px', marginBottom: '12px', color: '#666' }}>Shipping Method</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="shippingMethod" value="Standard" checked={formData.shippingMethod === 'Standard'} onChange={(e) => setFormData(prev => ({ ...prev, shippingMethod: e.target.value }))} />
                  Standard Shipping - PKR 220.00
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="shippingMethod" value="Free" checked={formData.shippingMethod === 'Free'} onChange={(e) => setFormData(prev => ({ ...prev, shippingMethod: e.target.value }))} />
                  Free Shipping (Orders over PKR 5000)
                </label>
              </div>
            </div>
          )}
        </div>

 
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '16px', overflow: 'hidden' }}>
          <div onClick={() => toggleSection('payment')} style={{ padding: '16px', backgroundColor: '#f5f5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1b5e20', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</span>
            <h3 style={{ margin: 0 }}>PAYMENT METHOD</h3>
          </div>
          {openSections.payment && (
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))} />
                  Cash on Delivery (COD)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="paymentMethod" value="Card" checked={formData.paymentMethod === 'Card'} onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))} />
                  Credit/Debit Card
                </label>
              </div>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            width: '100%', 
            padding: '16px', 
            backgroundColor: '#1b5e20', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            fontSize: '16px', 
            fontWeight: 'bold', 
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'PLACING ORDER...' : 'PLACE YOUR ORDER'}
        </button>
      </form>

      <div style={{ flex: '0 0 350px', minWidth: '280px' }}>
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', backgroundColor: '#fafafa' }}>
          <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>Your Bag ({localCart.length} items)</h2>
          
          {localCart.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px 0' }}>Your cart is empty</p>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              {localCart.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{item.name}</div>
                    <div style={{ color: '#666', fontSize: '14px' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: '500' }}>PKR {(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ borderTop: '2px solid #ddd', paddingTop: '16px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>ORDER SUMMARY</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Subtotal</span>
              <span>PKR {subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `PKR ${shipping.toFixed(2)}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd' }}>
              <span>Total</span>
              <span>PKR {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
