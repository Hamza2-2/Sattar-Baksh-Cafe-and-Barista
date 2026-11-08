import React, { useState } from 'react'
import { useUser } from '../../components/Contexts/UserContext'
import { useNavigate } from 'react-router-dom'
import './PersonalDetails.css'
import Banner from '../../components/Banner/Banner'

const PersonalDetails = () => {
  const { user, updatePersonalDetails } = useUser()
  const navigate = useNavigate()
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    age: user?.age || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

  
    if (!formData.firstName.trim()) {
      setError('First name is required')
      return
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required')
      return
    }
    if (!formData.age || formData.age < 13) {
      setError('Age must be at least 13')
      return
    }
 
    if (formData.newPassword) {
      if (formData.currentPassword !== user.password) {
        setError('Current password is incorrect')
        return
      }
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters')
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }
    }

    updatePersonalDetails({
      firstName: formData.firstName,
      lastName: formData.lastName,
      age: formData.age,
      password: formData.newPassword || undefined
    })

    setMessage('Profile updated successfully!')
    setEditMode(false)
    setFormData({
      ...formData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  return (
    <div className="personal-details-page">
      <Banner />
      <div className="personal-details-container">
        <div className="details-wrapper">
          <h1>Personal Details</h1>
          <p className="subtitle">Manage your personal information</p>

          <form onSubmit={handleSubmit} className="personal-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                />
                {editMode && (
                  <button type="button" className="edit-field-btn">Change</button>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                />
                {editMode && (
                  <button type="button" className="edit-field-btn">Change</button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                disabled={!editMode}
                min="13"
                required
              />
              {editMode && (
                <button type="button" className="edit-field-btn">Change</button>
              )}
            </div>

            {editMode && (
              <div className="password-section">
                <h3>Change Password (Optional)</h3>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password to change it"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <div className="form-actions">
              {!editMode ? (
                <button type="button" onClick={() => setEditMode(true)} className="edit-btn">
                  Edit Details
                </button>
              ) : (
                <>
                  <button type="submit" className="save-btn">Save Changes</button>
                  <button type="button" onClick={() => setEditMode(false)} className="cancel-btn">
                    Cancel
                  </button>
                </>
              )}
              <button type="button" onClick={() => navigate('/profile')} className="back-btn">
                Back to Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PersonalDetails
