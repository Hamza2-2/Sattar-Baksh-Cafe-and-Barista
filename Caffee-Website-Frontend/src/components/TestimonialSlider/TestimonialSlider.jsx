import React, { useState } from "react";
import "./TestimonialSlider.css";
import photo1 from "../../assets/chef.jpg";
import photo2 from "../../assets/ducky.jpg";
import photo3 from "../../assets/bhutto.jpg";
import coffeePlant from '../../assets/coffee-plant.png'; 

const data = [
  {
    img: photo1,
    quote:
      "Mujhe Gandi Naali ka Keera kaha jabke meri Raghon mein Sindhoor ki jagah Chai hai",
    name: "Nardena Modi Chaiwala",
    role: "Founder & CEO"
  },
  {
    img: photo2,
    quote:
      "Hemlo Ji ajj ke vlog mein hum Big Brother ki jail me Chai peene jaein ge",
    name: "Ducky Bhai",
    role: "new Chaiwala at Adiala Jail"
  },
  {
    img: photo3,
    quote:
      "Kapein tang rahi hain Bhutto ki General Hafiz Asim Munir Meri Jind Meri JaanChief of Defense Force the Sole Protector of the Islamic Repulic of Pakistan. The Rightful Lord of the Seven Kingdoms and kingthe first men  Ke samne ",
    name: "Billo Rani",
    role: "Certified Karachi killing Boi 2008"
  }
];

const TestimonialSlider = () => {
  const [index, setIndex] = useState(0);

  const prev = () =>
    setIndex((i) => (i === 0 ? data.length - 1 : i - 1));
  const next = () =>
    setIndex((i) => (i === data.length - 1 ? 0 : i + 1));

  const { img, quote, name, role } = data[index];

  return (
    <section className="testi-section">
     
      <div className="testi-img-wrapper">
        <img src={img} alt={name} />
      </div> 
      <button className="arrow left" onClick={prev} aria-label="Previous" />
      <button className="arrow right" onClick={next} aria-label="Next" />

      
      <div className="testi-text">
        <span className="quote-mark">❝</span>
        <p>{quote}</p>
        <h4>{name}</h4>
        <span className="role">/ {role}</span>
      </div>

      <div className="plant-image">
        <img src={coffeePlant} alt="plant" />
      </div>
    </section>
  );
};

export default TestimonialSlider;
