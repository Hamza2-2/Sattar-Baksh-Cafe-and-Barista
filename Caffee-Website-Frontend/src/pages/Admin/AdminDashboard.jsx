import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Hot Drinks',
    price: '',
    description: '',
    image_url: '',
    in_stock: true,
    visible: true
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/admin/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Invalid token');
        }

        const data = await response.json();
        setAdminUser(data.admin);
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin');
      }
    };

    verifyAdmin();
  }, [navigate]);

  useEffect(() => {
    if (adminUser) {
      fetchOrders();
      fetchProducts();
    }
  }, [adminUser]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/orders', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else if (response.status === 401 || response.status === 403) {
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/products', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin');
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const updateProduct = async (productId, updates) => {
    try {
      const response = await fetch(`http://localhost:5000/admin/products/${productId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        setProducts(products.map(product => 
          product.id === productId ? { ...product, ...updates } : product
        ));
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only image files (JPEG, PNG, GIF, WebP) are allowed!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }
 
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

       
      setNewProduct({ ...newProduct, image_url: data.imageUrl });
      console.log('Image uploaded:', data.imageUrl);
    } catch (err) {
      alert('Failed to upload image: ' + err.message);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setNewProduct({ ...newProduct, image_url: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addNewProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/admin/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price)
        })
      });
      if (response.ok) {
        const addedProduct = await response.json();
        setProducts([...products, addedProduct]);
        setShowAddProduct(false);
        setImagePreview(null);
        setNewProduct({
          name: '',
          category: 'Hot Drinks',
          price: '',
          description: '',
          image_url: '',
          in_stock: true,
          visible: true
        });
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`http://localhost:5000/admin/products/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Processing': '#f39c12',
      'Being Packaged': '#3498db',
      'On Route': '#9b59b6',
      'Completed': '#27ae60',
      'Cancelled': '#e74c3c'
    };
    return colors[status] || '#666';
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span>☕</span>
          <h2>SattarBaksh</h2>
          <p>Admin Panel</p>
        </div>

        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <span className="nav-icon">📦</span>
            Orders
            <span className="nav-badge">{orders.length}</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <span className="nav-icon">☕</span>
            Products
            <span className="nav-badge">{products.length}</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

 
      <main className="admin-main">
        <header className="admin-header">
          <h1>{activeTab === 'orders' ? 'Orders Management' : 'Products Management'}</h1>
          <div className="admin-header-actions">
            {activeTab === 'products' && (
              <button className="admin-add-btn" onClick={() => setShowAddProduct(true)}>
                + Add New Product
              </button>
            )}
          </div>
        </header>

        <div className="admin-content">
        
          {activeTab === 'orders' && (
            <div className="admin-orders">
              {orders.length === 0 ? (
                <div className="admin-empty">
                  <span>📦</span>
                  <p>No orders yet</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Address</th>
                      <th>Phone</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td className="order-number">{order.order_number}</td>
                        <td>{order.customer_name || 'Guest'}</td>
                        <td className="address-cell">
                          {order.delivery_address}, {order.delivery_city} - {order.delivery_postal_code}
                        </td>
                        <td>{order.delivery_phone}</td>
                        <td className="price-cell">PKR {parseFloat(order.total_amount).toFixed(2)}</td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(order.status) }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Being Packaged">Being Packaged</option>
                            <option value="On Route">On Route</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

  
          {activeTab === 'products' && (
            <div className="admin-products">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price (PKR)</th>
                    <th>In Stock</th>
                    <th>Visible</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <img 
                          src={product.image_url || 'https://via.placeholder.com/50'} 
                          alt={product.name}
                          className="product-thumb"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                        />
                      </td>
                      <td className="product-name">{product.name}</td>
                      <td>{product.category}</td>
                      <td>
                        <input
                          type="number"
                          value={product.price}
                          onChange={(e) => updateProduct(product.id, { price: parseFloat(e.target.value) })}
                          className="price-input"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={product.in_stock}
                            onChange={(e) => updateProduct(product.id, { in_stock: e.target.checked })}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </td>
                      <td>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={product.visible !== false}
                            onChange={(e) => updateProduct(product.id, { visible: e.target.checked })}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </td>
                      <td>
                        <button 
                          className="delete-btn"
                          onClick={() => deleteProduct(product.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

       
      {showAddProduct && (
        <div className="admin-modal-overlay" onClick={() => setShowAddProduct(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button className="modal-close" onClick={() => setShowAddProduct(false)}>×</button>
            </div>
            <form onSubmit={addNewProduct} className="add-product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g., Espresso"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                    <option value="Hot Drinks">Hot Drinks</option>
                    <option value="Cold Drinks">Cold Drinks</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Merchandise">Merchandise</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (PKR) *</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="e.g., 350"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

           
              <div className="form-group image-upload-section">
                <label>Product Image</label>
                
              
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  style={{ display: 'none' }}
                />
                
         
                <div className="image-preview-container">
                  {(imagePreview || newProduct.image_url) ? (
                    <div className="image-preview">
                      <img 
                        src={imagePreview || newProduct.image_url} 
                        alt="Preview" 
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Image+Error'; }}
                      />
                      <button 
                        type="button" 
                        className="clear-image-btn"
                        onClick={clearImage}
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="image-placeholder">
                      <span>📷</span>
                      <p>No image selected</p>
                    </div>
                  )}
                </div>

      
                <div className="image-upload-options">
                  <button 
                    type="button" 
                    className="upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? '⏳ Uploading...' : '📁 Upload from PC'}
                  </button>
                  
                  <span className="or-divider">OR</span>
                  
                  <input
                    type="text"
                    value={newProduct.image_url}
                    onChange={(e) => {
                      setNewProduct({ ...newProduct, image_url: e.target.value });
                      setImagePreview(null);
                    }}
                    placeholder="Paste image URL here..."
                    className="url-input"
                  />
                </div>
                <small className="image-help">Supported: JPEG, PNG, GIF, WebP (max 5MB)</small>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Describe the product..."
                  rows="3"
                />
              </div>

              <div className="form-row checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newProduct.in_stock}
                    onChange={(e) => setNewProduct({ ...newProduct, in_stock: e.target.checked })}
                  />
                  In Stock
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newProduct.visible}
                    onChange={(e) => setNewProduct({ ...newProduct, visible: e.target.checked })}
                  />
                  Visible to Customers
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddProduct(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
