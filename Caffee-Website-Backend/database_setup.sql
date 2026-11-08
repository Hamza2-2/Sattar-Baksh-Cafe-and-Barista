CREATE DATABASE IF NOT EXISTS coffee_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coffee_store;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  age INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  in_stock BOOLEAN DEFAULT TRUE,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wishlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  productId INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist (userId, productId)
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  estimated_delivery DATE,
  delivery_address VARCHAR(500) NOT NULL,
  delivery_city VARCHAR(100) NOT NULL,
  delivery_postal_code VARCHAR(20) NOT NULL,
  delivery_phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (userId),
  INDEX idx_created_at (created_at)
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_order_id (orderId)
) ENGINE=InnoDB;

CREATE TABLE payment_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  card_number VARCHAR(20) NOT NULL,
  cardHolder VARCHAR(255) NOT NULL,
  expiry_month INT NOT NULL,
  expiry_year INT NOT NULL,
  cvv VARCHAR(4),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (userId)
);

INSERT INTO products (name, category, price, in_stock, description, image_url) VALUES
('Espresso', 'Hot Drinks', 3.50, TRUE, 'Strong and bold espresso shot', 'https://via.placeholder.com/300?text=Espresso'),
('Cappuccino', 'Hot Drinks', 4.50, TRUE, 'Creamy cappuccino with milk foam', 'https://via.placeholder.com/300?text=Cappuccino'),
('Iced Latte', 'Cold Drinks', 5.00, TRUE, 'Refreshing iced latte', 'https://via.placeholder.com/300?text=Iced+Latte'),
('Americano', 'Hot Drinks', 3.75, TRUE, 'Classic americano', 'https://via.placeholder.com/300?text=Americano'),
('Mocha', 'Hot Drinks', 5.50, TRUE, 'Coffee and chocolate blend', 'https://via.placeholder.com/300?text=Mocha');
