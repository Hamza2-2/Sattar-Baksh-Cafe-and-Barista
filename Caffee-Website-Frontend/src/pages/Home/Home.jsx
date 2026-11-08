import React from 'react'
import Banner from '../../components/Banner/Banner'
import CoffeeMenu from '../../components/CoffeeMenu/CoffeeMenu'
import TestimonialSlider from '../../components//TestimonialSlider/TestimonialSlider'
import HomeProducts from '../../components/HomeProducts/HomeProducts'
import Categories from '../../components/Categories/Categories'

const Home = () => {
  return (
   <>
   <Banner />
   <Categories/>
   <CoffeeMenu />
   <TestimonialSlider/>
   <HomeProducts/>
   </>
  )
}
export default Home
