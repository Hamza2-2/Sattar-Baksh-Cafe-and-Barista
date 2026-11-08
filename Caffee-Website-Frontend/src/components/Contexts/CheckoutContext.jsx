import { createContext, useContext, useState } from 'react';
import API_BASE_URL from '../../config';

const CheckoutContext = createContext();

export function CheckoutProvider({ children }) {

  const [checkoutData, setCheckoutData] = useState({
    customerDetails: {
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      address: '',
      country: 'Pakistan',
      region: 'Islamabad Capital Territory',
      city: 'Islamabad',
      postalCode: '',
    },
    orderNumber: '',
    paymentStatus: 'Pending',
    orderStatus: 'Processing',
    estimatedDelivery: '',
    orderTotals: null,
    orderItems: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateCheckoutData = (data) => {
    setCheckoutData(prevData => ({
      ...prevData,
      ...data
    }));
  };

  const confirmOrder = () => {
    const orderNumber = '#ORD-' + Math.floor(10000 + Math.random() * 90000);
        
    const today = new Date();
    const deliveryDate = new Date(today);
    
    let businessDaysAdded = 0;
    while (businessDaysAdded < 7) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      if (deliveryDate.getDay() >= 1 && deliveryDate.getDay() <= 5) {
        businessDaysAdded++;
      }
    }
    
    const estimatedDelivery = deliveryDate.toISOString().split('T')[0];
        
    updateCheckoutData({
      orderNumber,
      estimatedDelivery,
    });
        
    return { orderNumber, estimatedDelivery };
  };

const submitOrder = async (cartItems, totals, customerDetails) => {
  if (isSubmitting) return;
  
  setIsSubmitting(true);
  
  try {
  const { orderNumber, estimatedDelivery } = confirmOrder();

  updateCheckoutData({
    orderTotals: totals,
    orderItems: cartItems
  });

  const customerData = {
    name: `${customerDetails.firstName} ${customerDetails.lastName}`,
    email: customerDetails.email,
    phone: customerDetails.mobile,
    address: `${customerDetails.address}, ${customerDetails.city}, ${customerDetails.country}`,
  };

    

    const orderData = {
      order_number: orderNumber,
      subtotal: totals.subtotal,
      shipping_cost: totals.shipping,
      total_amount: totals.finalTotal,
      payment_method: totals.paymentMethod || 'COD',
      status: 'Processing',
      estimated_delivery: estimatedDelivery,
      shipping_method: totals.shippingMethod || 'International Shipping',
      delivery_address: customerDetails.delivery_address || customerDetails.address,
      delivery_city: customerDetails.delivery_city || customerDetails.city,
      delivery_postal_code: customerDetails.delivery_postal_code || customerDetails.postalCode,
      delivery_phone: customerDetails.delivery_phone || customerDetails.mobile,
    };

    const orderItemsData = cartItems.map(item => ({
      product_id: item.id || item.product_id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    
    const response = await fetch(`${API_BASE_URL}/orders`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: customerData,
        order: orderData,
        items: orderItemsData,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to place order';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Order placed successfully:', result);
    
    return { success: true, orderNumber, estimatedDelivery };
    
  } catch (error) {
    console.error('Error submitting order:', error);
    throw error;
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <CheckoutContext.Provider value={{ 
      checkoutData, 
      updateCheckoutData, 
      confirmOrder, 
      submitOrder,
      isSubmitting 
    }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  return useContext(CheckoutContext);
}