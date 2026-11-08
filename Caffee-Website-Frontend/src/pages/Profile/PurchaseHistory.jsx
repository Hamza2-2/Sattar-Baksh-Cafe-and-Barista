import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../components/Contexts/UserContext'
import './PurchaseHistory.css'
import Banner from '../../components/Banner/Banner'
import { ShoppingBag, Download } from 'lucide-react'

const PurchaseHistory = () => {
  const { purchaseHistory } = useUser()
  const navigate = useNavigate()

  const downloadInvoice = (order) => {
   
    alert(`Invoice for Order #${order.orderId} would be downloaded here`)
  }

  return (
    <div className="purchase-history-page">
      <Banner />
      <div className="history-container">
        <div className="history-wrapper">
          <div className="header">
            <h1>Purchase History</h1>
            <p className="subtitle">View all your orders and transactions</p>
          </div>

          {purchaseHistory.length === 0 ? (
            <div className="no-purchases">
              <ShoppingBag size={64} />
              <h2>No Purchase History</h2>
              <p>You haven't made any purchases yet</p>
              <button onClick={() => navigate('/shop')} className="start-shopping-btn">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="purchases-list">
              {purchaseHistory.map((order, index) => (
                <div key={order.orderId} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Order #{order.orderId}</h3>
                      <p className="order-date">{order.date}</p>
                    </div>
                    <div className="order-status">
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="order-items">
                    <h4>Items Ordered:</h4>
                    {order.items && order.items.length > 0 ? (
                      <ul>
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            <span>{item.name}</span>
                            <span>x{item.quantity}</span>
                            <span className="price">PKR {item.price * item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Coffee products</p>
                    )}
                  </div>

                  <div className="order-footer">
                    <div className="total">
                      <strong>Total Amount:</strong>
                      <span>PKR {order.total}</span>
                    </div>
                    <div className="actions">
                      <button onClick={() => downloadInvoice(order)} className="download-btn">
                        <Download size={16} /> Download Invoice
                      </button>
                      <button onClick={() => navigate('/shop')} className="reorder-btn">
                        Reorder
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => navigate('/profile')} className="back-btn">Back to Profile</button>
        </div>
      </div>
    </div>
  )
}

export default PurchaseHistory
