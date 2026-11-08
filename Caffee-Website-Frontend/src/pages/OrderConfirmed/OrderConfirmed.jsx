import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './OrderConfirmed.css';

export default function OrderConfirmed() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [orderData, setOrderData] = useState(null);
  const [isShippingExpanded, setIsShippingExpanded] = useState(true);
  const [isOrderDetailsExpanded, setIsOrderDetailsExpanded] = useState(true);

  useEffect(() => {
    const stateData = location.state;
    const storedOrder = localStorage.getItem('lastOrder');
    
    if (stateData && stateData.orderNumber) {
      setOrderData(stateData);
    } else if (storedOrder) {
      try {
        setOrderData(JSON.parse(storedOrder));
      } catch (e) {
        console.error('Error parsing stored order:', e);
      }
    }
  }, [location.state]);

  const toggleShipping = () => setIsShippingExpanded(!isShippingExpanded);
  const toggleOrderDetails = () => setIsOrderDetailsExpanded(!isOrderDetailsExpanded);

  const formatDeliveryDate = (dateString) => {
    if (!dateString) {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() + 5);
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 10);
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return startDate.toLocaleDateString('en-US', options) + ' - ' + endDate.toLocaleDateString('en-US', options);
    }
    const date = new Date(dateString + 'T00:00:00');
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 3);
    return date.toLocaleDateString('en-US', options) + ' - ' + endDate.toLocaleDateString('en-US', options);
  };

  const handleContinueShopping = () => {
    localStorage.removeItem('lastOrder');
    navigate('/');
  };

  if (!orderData) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', backgroundColor: '#f8f9fa' }}>
        <div style={{ backgroundColor: 'white', padding: '60px 40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#4CAF50', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <span style={{ color: 'white', fontSize: '40px' }}></span>
          </div>
          <h1 style={{ color: '#333', marginBottom: '16px', fontSize: '28px' }}>Order Confirmed!</h1>
          <p style={{ color: '#666', marginBottom: '32px', fontSize: '16px' }}>Thank you for your order. Your coffee is on its way!</p>
          <button onClick={handleContinueShopping} style={{ backgroundColor: '#8B4513', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: '600' }}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  const { orderNumber, customer, items, totals, estimatedDelivery } = orderData;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '2px solid #eee' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: '#4CAF50', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: '28px' }}></span>
            </div>
            <h1 style={{ fontSize: '24px', color: '#333', margin: 0 }}>ORDER CONFIRMED</h1>
          </div>
          <div style={{ backgroundColor: '#f0f7f0', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
            <p style={{ margin: '0 0 8px', color: '#333' }}>Order Number: <strong style={{ color: '#8B4513' }}>{orderNumber}</strong></p>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Confirmation sent to: <strong>{customer?.email || 'your email'}</strong></p>
          </div>
          <div style={{ border: '1px solid #eee', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden' }}>
            <div onClick={toggleShipping} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: '#fafafa', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '28px', height: '28px', backgroundColor: '#8B4513', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>1</span>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>SHIPPING DETAILS</h3>
              </div>
              <span style={{ fontSize: '20px', color: '#666' }}>{isShippingExpanded ? '' : ''}</span>
            </div>
            {isShippingExpanded && (
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><p style={{ margin: '0 0 4px', color: '#888', fontSize: '13px' }}>Full Name</p><p style={{ margin: 0, color: '#333', fontWeight: '500' }}>{customer?.name || 'N/A'}</p></div>
                  <div><p style={{ margin: '0 0 4px', color: '#888', fontSize: '13px' }}>Phone</p><p style={{ margin: 0, color: '#333', fontWeight: '500' }}>{customer?.phone || 'N/A'}</p></div>
                  <div><p style={{ margin: '0 0 4px', color: '#888', fontSize: '13px' }}>City</p><p style={{ margin: 0, color: '#333', fontWeight: '500' }}>{customer?.city || 'N/A'}</p></div>
                  <div><p style={{ margin: '0 0 4px', color: '#888', fontSize: '13px' }}>Postal Code</p><p style={{ margin: 0, color: '#333', fontWeight: '500' }}>{customer?.postalCode || 'N/A'}</p></div>
                  <div style={{ gridColumn: '1 / -1' }}><p style={{ margin: '0 0 4px', color: '#888', fontSize: '13px' }}>Address</p><p style={{ margin: 0, color: '#333', fontWeight: '500' }}>{customer?.address || 'N/A'}</p></div>
                </div>
              </div>
            )}
          </div>
          <div style={{ border: '1px solid #eee', borderRadius: '8px', marginBottom: '24px', overflow: 'hidden' }}>
            <div onClick={toggleOrderDetails} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: '#fafafa', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '28px', height: '28px', backgroundColor: '#8B4513', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>2</span>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>ORDER STATUS</h3>
              </div>
              <span style={{ fontSize: '20px', color: '#666' }}>{isOrderDetailsExpanded ? '' : ''}</span>
            </div>
            {isOrderDetailsExpanded && (
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#666' }}>Payment Method:</span><span style={{ fontWeight: '500', color: '#333' }}>Cash on Delivery</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#666' }}>Payment Status:</span><span style={{ fontWeight: '500', color: '#f39c12' }}>Pending</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#666' }}>Order Status:</span><span style={{ fontWeight: '500', color: '#4CAF50' }}>Processing</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#666' }}>Estimated Delivery:</span><span style={{ fontWeight: '500', color: '#333' }}>{formatDeliveryDate(estimatedDelivery)}</span></div>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={handleContinueShopping} style={{ flex: 1, backgroundColor: '#8B4513', color: 'white', border: 'none', padding: '14px 24px', borderRadius: '8px', fontSize: '15px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}> Continue Shopping</button>
            <button style={{ flex: 1, backgroundColor: 'white', color: '#8B4513', border: '2px solid #8B4513', padding: '14px 24px', borderRadius: '8px', fontSize: '15px', cursor: 'pointer', fontWeight: '600' }}>Track Order</button>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #eee' }}>ORDER SUMMARY</h3>
          <div style={{ marginBottom: '20px' }}>
            {items && items.length > 0 ? items.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', marginBottom: '16px', borderBottom: index < items.length - 1 ? '1px solid #eee' : 'none' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {item.image ? (<img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />) : (<span style={{ fontSize: '24px' }}></span>)}
                </div>
                <div style={{ flex: 1 }}><p style={{ margin: '0 0 4px', fontWeight: '500', color: '#333', fontSize: '14px' }}>{item.name}</p><p style={{ margin: 0, color: '#888', fontSize: '13px' }}>Qty: {item.quantity}</p></div>
                <p style={{ margin: 0, fontWeight: '600', color: '#8B4513' }}>PKR {(item.price * item.quantity).toFixed(2)}</p>
              </div>
            )) : (<p style={{ color: '#666', textAlign: 'center' }}>No items</p>)}
          </div>
          <div style={{ borderTop: '2px solid #eee', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ color: '#666' }}>Subtotal</span><span style={{ color: '#333' }}>PKR {totals?.subtotal?.toFixed(2) || '0.00'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ color: '#666' }}>Shipping</span><span style={{ color: '#333' }}>PKR {totals?.shipping?.toFixed(2) || '0.00'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #8B4513' }}><span style={{ fontWeight: '700', fontSize: '18px', color: '#333' }}>Total</span><span style={{ fontWeight: '700', fontSize: '18px', color: '#8B4513' }}>PKR {totals?.total?.toFixed(2) || '0.00'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
