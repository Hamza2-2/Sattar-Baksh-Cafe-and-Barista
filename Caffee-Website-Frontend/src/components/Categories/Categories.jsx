import React from "react";
import "./Categories.css";
import coffeeBeans from '../../assets/coffee-beans.jpg';
import coffeeCup from '../../assets/coffee-cup.png';
import croissant from '../../assets/croissant.jpg';
import takeawayCup from '../../assets/takeaway-cup.jpg';
const cardData = [
  {
    title: "TYPES OF COFFEE",
    description: "This is the standard in coffee. It is the most common and most popular style.",
    image: coffeeCup
  },
  {
    title: "MULTIPLE BEAN VARIETIES",
    description: "The experimental design included a randomized complete block.",
    image: coffeeBeans
  },
  {
    title: "COFFEE & PASTRY",
    description: "This is the standard in coffee. It is the most common and most popular style.",
    image: croissant
  },
  {
    title: "COFFEE TO GO",
    description: "Experimental design included a randomized complete block design with three.",
    image: takeawayCup
  },
];

const Categories = () => {
  return (
    <div className="cards-container">
      {cardData.map((card, index) => (
        <div key={index} className="coffee-card">
          <img src={card.image} alt={card.title} className="coffee-icon" />
          <h3>{card.title}</h3>
          <p>{card.description}</p>
        </div>
      ))}
    </div>
  );
};

export default Categories;
