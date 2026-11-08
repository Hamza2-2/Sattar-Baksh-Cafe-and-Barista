import React from 'react'
import './About.css'
import { Heart, Leaf, Award, Users } from 'lucide-react'
import sirImage from '../../assets/sir.jpg'

const About = () => {
  const values = [
    {
      icon: <Heart size={32} />,
      title: 'Passion',
      description: 'We are passionate about crafting the perfect cup of coffee for you.'
    },
    {
      icon: <Leaf size={32} />,
      title: 'Sustainability',
      description: 'Ethically sourced beans from sustainable farms around the world.'
    },
    {
      icon: <Award size={32} />,
      title: 'Quality',
      description: 'Premium quality coffee beans selected and roasted to perfection.'
    },
    {
      icon: <Users size={32} />,
      title: 'Community',
      description: 'Building a community of coffee lovers and enthusiasts.'
    }
  ]

  return (
    <div className="about-page">
      <section className="about-intro">
        <div className="about-container">
          <h1>About SattarBaksh Coffee</h1>
          <p className="intro-text">
            Founded by Modi Sarkar, SattarBaksh mein Modi hai tou Mumkin hai sath mein Billo Rani aur Ducky Bhai humare Special Supplier hai sath agar sar pe Big Brother ka hath rahe tou Wahh Kia Baat hai
          </p>
        </div>
      </section>

      <section className="our-story">
        <div className="story-container">
          <div className="story-content">
            <h2>Our Story</h2>
            <p>
              What started as a vision by Modi Sarakr in 2025 has grown into a Pindi Boi Hotspot for Chapri worldwide. Modi's passion was simple: to collaborate with top influencers including Billo Rani and Ducky Bhai.
            </p>
            <p>
              Over the years, under Modi's leadership, we've expanded to exclusively servver our offerings, sasti chai making, and built a loyal community of shapatars who share our passion for absolutely nothing. Today, SattarBaksh Coffee stands as a testament to Big Brother's dedication, innovation, and an unwavering commitment to beating the Hell out of "Ap hote kon ho" logs.
            </p>
          </div>
          <div className="story-image">
            <img src={sirImage} alt="sir" />
          </div>
        </div>
      </section>

      <section className="our-values">
        <div className="values-container">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="statistics">
        <div className="stats-container">
          <div className="stat-item">
            <h3>25+</h3>
            <p>Years of Excellence</p>
          </div>
          <div className="stat-item">
            <h3>100K+</h3>
            <p>Happy Customers</p>
          </div>
          <div className="stat-item">
            <h3>50+</h3>
            <p>Coffee Varieties</p>
          </div>
          <div className="stat-item">
            <h3>30+</h3>
            <p>Countries Served</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
