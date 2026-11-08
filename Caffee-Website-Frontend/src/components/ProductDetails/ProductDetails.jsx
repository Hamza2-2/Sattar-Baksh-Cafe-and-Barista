import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDetails.css";
import defaultProductImage from "../../assets/product1.png";
import { useCart } from "../../components/Contexts/CartContext";
import API_BASE_URL from "../../config";

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(defaultProductImage);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await res.json();
        setProduct(data);
        setSelectedImage(data.image_url || data.image || defaultProductImage);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setError('Failed to load product details.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  
  const handleAddToCart = () => {
    if (product && product.in_stock) {
      addToCart(product, quantity);
      setShowModal(true);
    }
  };
  
  const goToCart = () => {
    setShowModal(false);
    navigate('/cart');
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate('/shop')}>Back to Shop</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <p>Product not found.</p>
        <button onClick={() => navigate('/shop')}>Back to Shop</button>
      </div>
    );
  }

  return (
    <div className="product-details-container">
      <div className="product-page">
        <div className="image-section">
          <img
            src={selectedImage}
            alt={product.name}
            className="main-image"
            onError={(e) => (e.target.src = defaultProductImage)}
          />
          {!product.in_stock && (
            <div className="out-of-stock-overlay">
              <span className="out-of-stock-label">OUT OF STOCK</span>
            </div>
          )}
        </div>

        <div className="info-section">
          <p className="category">{product.category || "Coffee | Light"}</p>
          <h2 className="product-title">{product.name}</h2>
          <p className="price">
            <span className="old-price">PKR {product.old_price}</span>{" "}
            PKR {product.price}
          </p>

          <div className="stock-status">
            <span className={`stock-indicator ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}>
              {product.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="quantity-control">
            <label>Quantity</label>
            <div className="controls">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={!product.in_stock}
              >
                -
              </button>
              <span>{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                disabled={!product.in_stock}
              >
                +
              </button>
            </div>
          </div>

          <button 
            className={`add-to-cart ${!product.in_stock ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={!product.in_stock}
          >
            {product.in_stock ? 'ADD TO CART' : 'OUT OF STOCK'}
          </button>

          <div className="collapsible-section">
            <div
              className="collapsible-header"
              onClick={() => setDetailsOpen(!detailsOpen)}
            >
              <span>Details</span>
              <span>{detailsOpen ? "-" : "+"}</span>
            </div>
            {detailsOpen && (
              <ul className="collapsible-content">
                <li>
                  <strong>Description:</strong> {product.description || "No description"}
                </li>
              </ul>
            )}
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button className="modal-close" onClick={closeModal}>×</button>
              <div className="modal-content">
                <div className="modal-icon">✓</div>
                <h3>Product Added to Cart!</h3>
                <p>{product.name} has been added to your cart.</p>
                <div className="modal-actions">
                  <button className="continue-shopping-m" onClick={closeModal}>
                    CONTINUE SHOPPING
                  </button>
                  <button className="view-cart" onClick={goToCart}>
                    VIEW CART
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="product-tabs-section">
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            DESCRIPTION
          </button>
          <button 
            className={`tab-button ${activeTab === 'additional' ? 'active' : ''}`}
            onClick={() => setActiveTab('additional')}
          >
            ADDITIONAL INFORMATION
          </button>
          <button 
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            REVIEWS (2)
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="tab-panel">
              <h3>Description</h3>
              <p>
                {product.description || "Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus."}
              </p>
            </div>
          )}

          {activeTab === 'additional' && (
            <div className="tab-panel">
              <div className="additional-info">
                <div className="info-row">
                  <span className="info-label">Weight:</span>
                  <span className="info-value">1 kg</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Dimensions:</span>
                  <span className="info-value">30 × 30 × 50 cm</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="tab-panel">
              <div className="reviews-section">
                <div className="review-item">
                  <div className="review-header">
                    <span className="reviewer-name">Jane Doe</span>
                    <div className="rating">
                      <span className="stars">★★★★★</span>
                      <span className="review-date">May 15, 2025</span>
                    </div>
                  </div>
                  <p className="review-text">
                    Beautiful product! It arrived in perfect condition and looks exactly like the pictures.
                  </p>
                </div>

                <div className="review-item">
                  <div className="review-header">
                    <span className="reviewer-name">John Smith</span>
                    <div className="rating">
                      <span className="stars">★★★★☆</span>
                      <span className="review-date">May 10, 2025</span>
                    </div>
                  </div>
                  <p className="review-text">
                    Great product, very happy with my purchase. Fast delivery too!
                  </p>
                </div>

                <button className="write-review-btn">WRITE A REVIEW</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;