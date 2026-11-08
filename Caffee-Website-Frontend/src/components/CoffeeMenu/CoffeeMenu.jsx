import React from "react";
import "./CoffeeMenu.css";

import coffee1 from '../../assets/menu-coffee-1.png';
import coffee2 from '../../assets/menu-coffee-2.png';
import coffee3 from '../../assets/menu-coffee-3.jpg';
import coffee4 from '../../assets/menu-coffee-4.jpg';
import coffee5 from '../../assets/menu-coffee-5.png';
import coffee6 from '../../assets/menu-coffee-6.png';

const menuItems = [
  { image: coffee1, name: "Americano Coffee", price: "PKR 350" },
  { image: coffee2, name: "Virgin Coffee greed", price: "PKR 300" },
  { image: coffee3, name: "Italian Roosted Coffee", price: "PKR 350" },
  { image: coffee4, name: "Japan's Coffee Greed", price: "PKR 200" },
  { image: coffee5, name: "Brazilan Rosted Coffee", price: "PKR 450" },
  { image: coffee6, name: "Best Latte Macchiato", price: "PKR 350" },
];

const CoffeeMenu = () => {
  return (
    <div className="menu-section">
      <h2>Popular Menu</h2>
      <p>
        We Produce Blends of the Most Aromatic Coffee.My seattle show in November!
        <br />
        If you want to visit my booth, please check here
      </p>
      <div className="menu-grid">
        {menuItems.map((item, index) => (
          <div className="menu-card" key={index}>
            <img src={item.image} alt={item.name} className="menu-image" />
            <span className="menu-name">{item.name}</span>
            <span className="menu-price">{item.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoffeeMenu;
