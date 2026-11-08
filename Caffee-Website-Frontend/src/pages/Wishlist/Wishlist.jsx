import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../../components/Contexts/UserContext'
import { useCart } from '../../components/Contexts/CartContext'
import './Wishlist.css'
import Banner from '../../components/Banner/Banner'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import API_BASE_URL from '../../config'
import defaultProductImage from '../../assets/product1.png'

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useUser()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  
  const getImageUrl = (product) => {
    if (!product.image_url && !product.image) return defaultProductImage;
    const imageUrl = product.image_url || product.image;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  const handleAddToCart = (product) => {
    addToCart(product, 1)
    alert(`${product.name} added to cart!`)
  }

  const handleBuyNow = (product) => {
    addToCart(product, 1)
    navigate('/checkout')
  }

  return (
    <div className="wishlist-page">
      <Banner />
      <div className="wishlist-container">
        <h1>❤️ My Wishlist</h1>

        {wishlist.length === 0 ? (
          <div className="empty-wishlist">
            <Heart size={64} />
            <h2>Your wishlist is empty</h2>
            <p>Products you like will appear here</p>
            <Link to="/shop" className="continue-shopping-btn">Continue Shopping</Link>
          </div>
        ) : (
          <>
            <p className="wishlist-count">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in your wishlist</p>
            <div className="wishlist-grid">
              {wishlist.map((product) => (
                <div key={product.id} className="wishlist-card">
                  <div className="product-image">
                    <img 
                      src={getImageUrl(product)} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = defaultProductImage;
                      }}
                    />
                    <button 
                      className="remove-heart-btn"
                      onClick={() => removeFromWishlist(product.id)}
                      title="Remove from wishlist"
                    >
                      <Heart size={20} fill="#e74c3c" color="#e74c3c" />
                    </button>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="category">{product.category}</p>
                    <p className="price">PKR {parseFloat(product.price).toFixed(2)}</p>
                    {product.description && (
                      <p className="description">{product.description}</p>
                    )}
                    <div className="stock-status">
                      <span className={`stock-badge ${product.in_stock !== false ? 'in-stock' : 'out-of-stock'}`}>
                        {product.in_stock !== false ? '✓ In Stock' : '✗ Out of Stock'}
                      </span>
                    </div>
                    <div className="product-actions">
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.in_stock === false}
                      >
                        <ShoppingCart size={16} />
                        Add to Cart
                      </button>
                      <button 
                        className="buy-now-btn"
                        onClick={() => handleBuyNow(product)}
                        disabled={product.in_stock === false}
                      >
                        Buy Now
                      </button>
                    </div>
                    <div className="secondary-actions">
                      <button 
                        onClick={() => removeFromWishlist(product.id)}
                        className="remove-btn"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Wishlist
