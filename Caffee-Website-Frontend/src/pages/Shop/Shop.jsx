import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import './Shop.css';
import defaultProductImage from '../../assets/product1.png';
import API_BASE_URL from '../../config';
import { useUser } from '../../components/Contexts/UserContext';

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

const CollapsibleSection = ({ title, isOpen, toggleOpen, children }) => {
  const contentRef = useRef(null);
  
  return (
    <div className="filter-section">
      <div className="filter-header" onClick={toggleOpen}>
        <h3 className="filter-title">{title}</h3>
        <span className="toggle-icon">{isOpen ? '−' : '+'}</span>
      </div>
      <div
        className="collapsible-content"
        ref={contentRef}
        style={{
          maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : '0px',
        }}
      >
        {children}
      </div>
    </div>
  );
};

const SidebarFilter = ({ filters, onFilterChange, productCounts }) => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(true);
  const [availabilityOpen, setAvailabilityOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  
  const handleSearchChange = (value) => {
    onFilterChange({ ...filters, search: value });
  };

  const handleAvailabilityChange = (type) => {
    const newAvailability = { ...filters.availability };
    newAvailability[type] = !newAvailability[type];
    onFilterChange({ ...filters, availability: newAvailability });
  };

  const handlePriceChange = (field, value) => {
    const newPrice = { ...filters.price };
    newPrice[field] = value;
    onFilterChange({ ...filters, price: newPrice });
  };

  const applyPriceFilter = () => {
  
    onFilterChange({ ...filters });
  };

  const clearAllFilters = () => {
    onFilterChange({
      search: '',
      availability: { inStock: false, outOfStock: false },
      price: { min: '', max: '' }
    });
  };
  
  return (
    <div className="sidebar-filter">
      
      <CollapsibleSection
        title="Search"
        isOpen={searchOpen}
        toggleOpen={() => setSearchOpen(!searchOpen)}
      >
        <div className="search-container">
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="search-input"
          />
          <div className="search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
        </div>
      </CollapsibleSection>
      
      <CollapsibleSection
        title="Availability"
        isOpen={availabilityOpen}
        toggleOpen={() => setAvailabilityOpen(!availabilityOpen)}
      >
        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={filters.availability.inStock}
              onChange={() => handleAvailabilityChange('inStock')}
            />
            In stock ({productCounts.inStock})
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={filters.availability.outOfStock}
              onChange={() => handleAvailabilityChange('outOfStock')}
            />
            Out of stock ({productCounts.outOfStock})
          </label>
        </div>
      </CollapsibleSection>
      
      <CollapsibleSection
        title="Price"
        isOpen={priceOpen}
        toggleOpen={() => setPriceOpen(!priceOpen)}
      >
        <div className="price-inputs">
          <label>From</label>
          <input 
            type="number" 
            placeholder="PKR 0" 
            value={filters.price.min}
            onChange={(e) => handlePriceChange('min', e.target.value)}
          />
          <label>To</label>
          <input 
            type="number" 
            placeholder="PKR 5000" 
            value={filters.price.max}
            onChange={(e) => handlePriceChange('max', e.target.value)}
          />
        </div>
        <button className="filter-btn" onClick={applyPriceFilter}>Filter</button>
        <button className="clear-btn" onClick={clearAllFilters}>Clear All</button>
      </CollapsibleSection>
    </div>
  );
};

const ProductGrid = ({ products, error }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;
  const navigate = useNavigate();
  const { isLoggedIn, isInWishlist, toggleWishlist } = useUser();

  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + productsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: document.querySelector('.product-grid').offsetTop - 100, behavior: 'smooth' });
    }
  };

  const handleLikeClick = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn) {
      alert('Please login to add products to your wishlist');
      navigate('/login');
      return;
    }
    
    await toggleWishlist(product);
  };
 
  useEffect(() => {
  if (currentPage !== 1) return;
  setCurrentPage(1);
  }, [products]);


  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (products.length === 0) {
    return <div className="empty-container">No products match your filters</div>;
  }

  return (
    <div className="product-grid-container">
      <div className="product-grid">
        {currentProducts.map((product) => (
          <div className="product-card" key={product._id || product.id}>
            <div className="image-wrapper">
        
              <button 
                className={`like-btn ${isInWishlist(product.id) ? 'liked' : ''}`}
                onClick={(e) => handleLikeClick(e, product)}
                title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart 
                  size={20} 
                  fill={isInWishlist(product.id) ? '#e74c3c' : 'none'} 
                  color={isInWishlist(product.id) ? '#e74c3c' : '#666'}
                />
              </button>
       
              {(product.in_stock === false || product.in_stock === 0 || product.in_stock === '0') && (
                <span className="label soldout">Sold Out</span>
              )}
              {product.label && (product.in_stock === true || product.in_stock === 1 || product.in_stock === '1') && (
                <span className={`label ${product.label.toLowerCase() === "soldout" ? "soldout" : "sale"}`}>
                  {product.label}
                </span>
              )}
              {product.discount && <span className="discount">{product.discount}</span>}
              <a href={`/products/${product.id}`}>
                <img 
                  src={product.image_url || product.image || defaultProductImage} 
                  alt={product.name} 
                  onError={(e) => {
                    e.target.src = defaultProductImage;
                  }}
                />
              </a>
            </div>
            <div className="product-info">
              <h4>{product.name}</h4>
              <div className="price">
                <span className="current">PKR {parseFloat(product.price).toFixed(2)}</span>
                {product.old_price && product.old_price !== product.price && (
                  <span className="old">PKR {parseFloat(product.old_price).toFixed(2)}</span>
                )}
              </div>
         
              <div className="stock-status">
                <span className={`stock-indicator ${(product.in_stock === true || product.in_stock === 1 || product.in_stock === '1') ? 'in-stock' : 'out-of-stock'}`}>
                  {(product.in_stock === true || product.in_stock === 1 || product.in_stock === '1') ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <span
            className={`page-link ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Prev
          </span>
          {[...Array(totalPages)].map((_, index) => (
            <span
              key={index}
              className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </span>
          ))}
          <span
            className={`page-link ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </span>
        </div>
      )}
    </div>
  );
};

const Shop = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    availability: { inStock: false, outOfStock: false },
    price: { min: '', max: '' }
  });

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setAllProducts(data);
        setFilteredProducts(data);
      } else {
        setAllProducts([]);
        setFilteredProducts([]);
        setError('Unexpected data format received');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, []);
 
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProducts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (allProducts.length === 0) return;

    let filtered = [...allProducts];

    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm)) ||
        (product.category && product.category.toLowerCase().includes(searchTerm))
      );
    }

  
    const { inStock, outOfStock } = filters.availability;
    if (inStock || outOfStock) {
      filtered = filtered.filter(product => {
     
        const isInStock = product.in_stock === true || product.in_stock === 1 || product.in_stock === '1';
        if (inStock && outOfStock) return true;
        if (inStock) return isInStock;
        if (outOfStock) return !isInStock;
        return false;
      });
    }

     
    const { min, max } = filters.price;
    if (min !== '' || max !== '') {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price);
        const minPrice = min === '' ? 0 : parseFloat(min);
        const maxPrice = max === '' ? Infinity : parseFloat(max);
        
        return price >= minPrice && price <= maxPrice;
      });
    }

    setFilteredProducts(filtered);
  }, [allProducts, filters]);

 
  const productCounts = {
    inStock: allProducts.filter(product => product.in_stock === true || product.in_stock === 1 || product.in_stock === '1').length,
    outOfStock: allProducts.filter(product => product.in_stock === false || product.in_stock === 0 || product.in_stock === '0' || product.in_stock === null || product.in_stock === undefined).length
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
 
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="shop-layout">
      <SidebarFilter 
        filters={filters}
        onFilterChange={handleFilterChange}
        productCounts={productCounts}
      />
      <ProductGrid 
        products={filteredProducts}
        error={error}
      />
    </div>
  );
};

export default Shop;