import React from "react";
import './Button.css'; 
const Button = ({ label, href, onClick }) => {
  return (
  <>
  <div className="btn">
    <a
      href={href}
      onClick={onClick}
     
    >
      {label}
    </a>
  </div>
  </>
  );
};

export default Button;
