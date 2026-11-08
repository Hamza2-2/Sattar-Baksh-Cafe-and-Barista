import React from 'react'
import './Feedback.css'
import TestimonialSlider from '../TestimonialSlider/TestimonialSlider'

const Feedback = () => {
  return (
   <>
   <section className='feedback-section'>
    <div className='container'>
        <h2>Our coffee perfection feedback</h2>
        <p>Our customers has amazing things to say about us</p>
        <TestimonialSlider />

    </div>

   </section>
   
   </>
  )
}

export default Feedback
