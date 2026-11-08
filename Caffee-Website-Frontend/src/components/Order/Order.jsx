import React from 'react'
import './Order.css'
import Orderimg from '../../assets/order-thumbnail.png'
import Button from '../Button/Button';
const Order = () => {
  return (
    <>
    <section className='order-section'>
         <div className='container'>
          <div className='order-left'>
            <h2>Get a chance to have an
            Amazing morning</h2>
            <p>We are giving you are one time opportunity to
            experience a better life with coffee.</p>
            <Button label="Order Now" href="/" />

          </div>
          <div className='order-right'>
          <img src={Orderimg} alt="Order Thumbnail" />

          </div>

        </div>

    </section>
    </>
  )
}

export default Order
