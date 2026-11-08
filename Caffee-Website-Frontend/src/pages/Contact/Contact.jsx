import React, { useState } from 'react'
import FormInput from '../../components/FormInput/FormInput'
import './Contact.css'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import API_BASE_URL from '../../config'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setSubmitStatus(null), 5000)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error:', error)
      setSubmitStatus('error')
    }
  }

  const contactInfo = [
    {
      icon: <Phone size={24} />,
      title: 'Phone',
      content: '090078601(TeleFun)',
      link: 'tel:090078601'
    },
    {
      icon: <Mail size={24} />,
      title: 'Email',
      content: 'info@bigbrother.com',
      link: 'mailto:info@bigbrother.com'
    },
    {
      icon: <MapPin size={24} />,
      title: 'Address',
      content: 'Bilawal House - Karachi'
    },
    {
      icon: <Clock size={24} />,
      title: 'Hours',
      content: 'Mon-Sun: 8:00 AM - 10:00 PM'
    }
  ]

  return (
    <div className="contact-page">
      <FormInput />
      
      <section className="contact-main">
        <div className="contact-container">
          <h1>Get in Touch</h1>
          <p className="subtitle">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>

          <div className="contact-content">
            <div className="contact-form-wrapper">
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    rows="6"
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">Send Message</button>

                {submitStatus === 'success' && (
                  <div className="status-message success">
                    ✓ Message sent successfully! We'll get back to you soon.
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="status-message error">
                    ✗ Error sending message. Please try again.
                  </div>
                )}
              </form>
            </div>

            <div className="contact-info-wrapper">
              <h2>Contact Information</h2>
              <div className="info-cards">
                {contactInfo.map((info, index) => (
                  <div key={index} className="info-card">
                    <div className="info-icon">{info.icon}</div>
                    <h3>{info.title}</h3>
                    {info.link ? (
                      <a href={info.link}>{info.content}</a>
                    ) : (
                      <p>{info.content}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3617.9389947396767!2d67.01907097346237!3d24.77415217632207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33e7e7e7e7e7d%3A0x0!2sClifton%2C%20Karachi!5e0!3m2!1sen!2spk!4v1234567890"
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: '12px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
