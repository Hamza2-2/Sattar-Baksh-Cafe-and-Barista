import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './PaymentCredentials.css'
import Banner from '../../components/Banner/Banner'
import { Trash2, Plus } from 'lucide-react'

const PaymentCredentials = () => {
  const navigate = useNavigate()
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      cardName: 'My Visa Card',
      cardNumber: '**** **** **** 1234',
      cardType: 'Visa',
      expiryDate: '12/25',
      isDefault: true
    }
  ])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddPayment = (e) => {
    e.preventDefault()
    if (!formData.cardName || !formData.cardNumber || !formData.expiryDate) {
      alert('Please fill all required fields')
      return
    }

    const newPayment = {
      id: Date.now(),
      cardName: formData.cardName,
      cardNumber: `**** **** **** ${formData.cardNumber.slice(-4)}`,
      cardType: 'Credit Card',
      expiryDate: formData.expiryDate,
      isDefault: false
    }

    setPaymentMethods([...paymentMethods, newPayment])
    setFormData({
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    })
    setShowAddForm(false)
    setMessage('Payment method added successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      setPaymentMethods(paymentMethods.filter(method => method.id !== id))
      setMessage('Payment method deleted')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleSetDefault = (id) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })))
    setMessage('Default payment method updated')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="payment-credentials-page">
      <Banner />
      <div className="payment-container">
        <div className="payment-wrapper">
          <div className="header">
            <h1>Payment Methods</h1>
            <button onClick={() => setShowAddForm(!showAddForm)} className="add-payment-btn">
              <Plus size={20} /> Add Payment Method
            </button>
          </div>

          {message && <div className="success-message">{message}</div>}

          {showAddForm && (
            <div className="add-payment-form">
              <h2>Add New Payment Method</h2>
              <form onSubmit={handleAddPayment}>
                <div className="form-group">
                  <label htmlFor="cardName">Card Name (e.g., My Visa)</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    placeholder="Give this card a name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cardholderName">Cardholder Name</label>
                  <input
                    type="text"
                    id="cardholderName"
                    name="cardholderName"
                    value={formData.cardholderName}
                    onChange={handleChange}
                    placeholder="Name on card"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="16"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      maxLength="3"
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">Add Card</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="payment-methods-list">
            <h2>Your Payment Methods</h2>
            {paymentMethods.length === 0 ? (
              <p className="no-methods">No payment methods added yet</p>
            ) : (
              <div className="methods-grid">
                {paymentMethods.map(method => (
                  <div key={method.id} className={`payment-card ${method.isDefault ? 'default' : ''}`}>
                    <div className="card-header">
                      <div>
                        <h3>{method.cardName}</h3>
                        {method.isDefault && <span className="default-badge">Default</span>}
                      </div>
                    </div>
                    <div className="card-details">
                      <p><strong>Type:</strong> {method.cardType}</p>
                      <p><strong>Number:</strong> {method.cardNumber}</p>
                      <p><strong>Expires:</strong> {method.expiryDate}</p>
                    </div>
                    <div className="card-actions">
                      {!method.isDefault && (
                        <button 
                          onClick={() => handleSetDefault(method.id)}
                          className="set-default-btn"
                        >
                          Set as Default
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(method.id)}
                        className="delete-btn"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => navigate('/profile')} className="back-btn">Back to Profile</button>
        </div>
      </div>
    </div>
  )
}

export default PaymentCredentials
