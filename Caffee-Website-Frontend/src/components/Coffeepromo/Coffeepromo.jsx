import React from "react";
import "./CoffeePromo.css";
import coffeeMan from '../../assets/coffee-beans.png'; 
import coffeePlant from '../../assets/coffee-plant.png'; 
import coffeeBeans from '../../assets/coffee-beans-with-leafs.png'; 


const CoffeePromo = () => {
  return (
    <div className="promo-container">
      
      <div className="beans-image">
        <img src={coffeeBeans} alt="plant" />
      </div>

      <div className="promo-image">
        <img src={coffeeMan} alt="Coffee Man" />
      </div>

      <div className="promo-text">
        <h1>Arabica & Robusta</h1>
        <h2>New Exclusive Coffee</h2>
        <p>
          Maecenas dapibus mattis eros, at fermentum sapien malesuada sit amet.
          Quisque in sollicitudin eros. Aliquam eget sapien sed orci accumsan
          interdum at ac m lorem ut ante pulvinar finibus non non metusi.
        </p>

        <div className="promo-info">
          <div className="info-item">
            <span className="icon">📄</span>
            <span className="info-text"><strong>Download price</strong></span>
          </div>
          <div className="info-item">
            <span className="icon">📞</span>
            <span className="info-text"><strong>3–068–387–01–39</strong></span>
          </div>
        </div>

        <div className="promo-buttons">
          <button className="btn dark">READ MORE</button>
          <button className="btn light">SHOP NOW</button>
        </div>
      </div>

      <div className="plant-image">
        <img src={coffeePlant} alt="plant" />
      </div>
    </div>
  );
};

export default CoffeePromo;
