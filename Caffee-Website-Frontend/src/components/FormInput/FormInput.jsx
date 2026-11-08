import React from 'react'
import './FormInput.css'

const FormInput = () => {
  return (
    <>
      <div className="subscribe-container">
      <input
        type="email"
        placeholder="Enter your mail"
        className="subscribe-input"
      />
      <button className="subscribe-button">
        Subscribe
      </button>
    </div>
    
    </>
 
  )
}

export default FormInput
