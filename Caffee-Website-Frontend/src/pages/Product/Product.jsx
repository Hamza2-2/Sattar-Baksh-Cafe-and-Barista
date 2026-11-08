
import ProductDetails from '../../components/ProductDetails/ProductDetails';
import './Product.css';

const Product = () => {
  return (
    <>
     
      <Route path="/products/:id" element={<ProductDetails />} />
    </>
  );
};

export default Product;
