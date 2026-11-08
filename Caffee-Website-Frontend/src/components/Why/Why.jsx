import React from 'react';
import './Why.css';
import Button from '../Button/Button';
import whyThumbnail from '../../assets/why-thumbnail.png'; 
import whyThumbnail1 from '../../assets/why-thumbnail1.png';
import whyThumbnail2 from '../../assets/why-thumbnail2.png';
import whyThumbnail3 from '../../assets/why-thumbnail3.png';


const cardData = [
  {
    image: whyThumbnail, 
    title: "Supreme Beans",
    description: "Beans that provide great taste",
  },
  {
    image: whyThumbnail1, 
    title: "High Quality",
    description: "We provide the highest quality  ",
  },
  {
    image: whyThumbnail2,
    title: "Extraordinary ",
    description: "Coffee like you have never tasted",
  },
  {
    image:whyThumbnail3,
    title: "Affordable Price",
    description: "Our Coffee prices are easy to afford",
  },
];

const Why = () => {
  return (
    <section className="why-section">
      <div className="container">
        <h2>Why are we different?</h2>
        <p>We don’t just make your coffee, we make your day!</p>
        
        <div className="why-cards">
          {cardData.map((card, index) => (
            <div key={index} className="why-card">
              <div className="icon-wrapper">
                <img src={card.image} alt={card.title} className="why-icon" />
              </div>
              <h3>{card.title}</h3>
              <span className='why-span'>{card.description}</span>
            </div>
          ))}
        </div>
        <div className='why-btm-details'>
            <p>Great ideas start with great coffee, Lets help you achieve that</p>
            <h4>Get started today.</h4>
            <Button label="Join Us" href="/"/>

        </div>
      </div>
    </section>
  );
};

export default Why;
