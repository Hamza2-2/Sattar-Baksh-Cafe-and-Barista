import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../../components/Contexts/UserContext'
import './Profile.css'
import Banner from '../../components/Banner/Banner'
import { User, CreditCard, ShoppingBag, LogOut } from 'lucide-react'

const Profile = () => {
  const { user, isLoggedIn, logout, purchaseHistory } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('overview')

  if (!isLoggedIn) {
    return (
      <div className="profile-page">
        <Banner />
        <div className="profile-container">
          <div className="not-logged-in">
            <h1>Please Log In</h1>
            <p>You need to be logged in to access your profile</p>
            <div className="auth-buttons">
              <button onClick={() => navigate('/login')} className="login-btn">Login</button>
              <button onClick={() => navigate('/register')} className="register-btn">Create Account</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="profile-page">
      <Banner />
      <div className="profile-container">
        <div className="profile-header">
          <h1>Welcome, {user.firstName}!</h1>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} /> Logout
          </button>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <User size={20} /> Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <User size={20} /> Personal Details
          </button>
          <button 
            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={20} /> Payment Methods
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <ShoppingBag size={20} /> Purchase History
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'overview' && (
            <div className="tab-content">
              <h2>Your Profile Overview</h2>
              <div className="overview-grid">
                <div className="overview-card">
                  <h3>Personal Information</h3>
                  <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Age:</strong> {user.age}</p>
                  <p><strong>Member Since:</strong> {user.createdAt}</p>
                </div>
                <div className="overview-card">
                  <h3>Account Stats</h3>
                  <p><strong>Total Purchases:</strong> {purchaseHistory.length}</p>
                  <p><strong>Account Status:</strong> <span className="active">Active</span></p>
                  <button onClick={() => setActiveTab('personal')} className="action-btn">Edit Profile</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="tab-content">
              <div className="page-wrapper">
                {window.location.pathname !== '/profile/personal-details' && (
                  <>
                    <h2>Personal Details</h2>
                    <p>Manage your personal information and security settings</p>
                    <button onClick={() => navigate('/profile/personal-details')} className="manage-btn">Edit Details</button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="tab-content">
              <h2>Payment Methods</h2>
              <p>Manage your payment credentials and cards</p>
              <button onClick={() => navigate('/profile/payment-credentials')} className="manage-btn">Manage Payment Methods</button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-content">
              <h2>Purchase History</h2>
              {purchaseHistory.length === 0 ? (
                <div className="no-data">
                  <p>No purchase history yet</p>
                  <button onClick={() => navigate('/shop')} className="shop-btn">Start Shopping</button>
                </div>
              ) : (
                <button onClick={() => navigate('/profile/purchase-history')} className="manage-btn">View Full History</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
