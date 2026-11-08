import React from 'react';
import './App.css'; 
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer'; 
import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
import Product from './pages/Product/Product';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import OrderConfirmed from './pages/OrderConfirmed/OrderConfirmed';
import ProductDetails from './components/ProductDetails/ProductDetails';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Wishlist from './pages/Wishlist/Wishlist';
import Profile from './pages/Profile/Profile';
import PersonalDetails from './pages/Profile/PersonalDetails';
import PaymentCredentials from './pages/Profile/PaymentCredentials';
import PurchaseHistory from './pages/Profile/PurchaseHistory';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import { CartProvider  } from "./components/Contexts/CartContext"; 
import { CheckoutProvider } from './components/Contexts/CheckoutContext';
import { UserProvider } from './components/Contexts/UserContext';
 
const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main>{children}</main>
      {!isAdminRoute && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <CartProvider>
          <CheckoutProvider>
            <Layout>
              <Routes>
                <Route path='/' element={<Home/>} />
                <Route path='/shop' element={<Shop/>} />
                <Route path='/about' element={<About/>} />
                <Route path='/contact' element={<Contact/>} />
                <Route path='/product' element={<Product/>} />
                <Route path='/cart' element={<Cart/>} />
                <Route path='/checkout' element={<Checkout/>} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path='/order-confirmed' element={<OrderConfirmed/>} />
                <Route path='/login' element={<Login/>} />
                <Route path='/register' element={<Register/>} />
                <Route path='/wishlist' element={<Wishlist/>} />
                <Route path='/profile' element={<Profile/>} />
                <Route path='/profile/personal-details' element={<PersonalDetails/>} />
                <Route path='/profile/payment-credentials' element={<PaymentCredentials/>} />
                <Route path='/profile/purchase-history' element={<PurchaseHistory/>} />
                <Route path='/admin' element={<AdminLogin/>} />
                <Route path='/admin/dashboard' element={<AdminDashboard/>} />
              </Routes>
            </Layout>
          </CheckoutProvider>
        </CartProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;
