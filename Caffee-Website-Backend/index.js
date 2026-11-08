const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
});

app.use('/uploads', express.static(uploadsDir));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("JWT_SECRET is not set. Define it in .env (see .env.example).");
  process.exit(1);
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No admin token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, admin) => {
    if (err) return res.status(403).json({ error: "Invalid or expired admin token" });
    if (!admin.isAdmin) return res.status(403).json({ error: "Not authorized as admin" });
    req.admin = admin;
    next();
  });
};

app.post("/api/auth/register", async (req, res) => {
  let connection;
  try {
    const { email, password, firstName, lastName, age } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    connection = await pool.getConnection();

    const [existingUser] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      await connection.release();
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.execute(
      "INSERT INTO users (email, password, firstName, lastName, age) VALUES (?, ?, ?, ?, ?)",
      [email, hashedPassword, firstName, lastName, age || null]
    );

    const token = jwt.sign({ email, firstName }, JWT_SECRET, {
      expiresIn: "7d",
    });

    await connection.release();

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        email,
        firstName,
        lastName,
        age,
      },
    });
  } catch (error) {
    if (connection) await connection.release();
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message || "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  let connection;
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      await connection.release();
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      await connection.release();
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    await connection.release();

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
      },
    });
  } catch (error) {
    if (connection) await connection.release();
    console.error("Login error:", error);
    res.status(500).json({ error: error.message || "Login failed" });
  }
});

app.get("/api/auth/user", authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT id, email, firstName, lastName, age FROM users WHERE email = ?",
      [req.user.email]
    );

    await connection.release();

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: users[0].id,
        email: users[0].email,
        firstName: users[0].firstName,
        lastName: users[0].lastName,
        age: users[0].age,
      },
    });
  } catch (error) {
    if (connection) await connection.release();
    console.error("Get user error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch user" });
  }
});

app.put("/api/auth/user", authenticateToken, async (req, res) => {
  let connection;
  try {
    const { firstName, lastName, age, currentPassword, newPassword } = req.body;

    connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT password FROM users WHERE email = ?",
      [req.user.email]
    );

    if (users.length === 0) {
      await connection.release();
      return res.status(404).json({ error: "User not found" });
    }

    if (newPassword) {
      if (!currentPassword) {
        await connection.release();
        return res.status(400).json({ error: "Current password required" });
      }
      const passwordMatch = await bcrypt.compare(currentPassword, users[0].password);
      if (!passwordMatch) {
        await connection.release();
        return res.status(401).json({ error: "Current password incorrect" });
      }
    }

    let updateQuery = "UPDATE users SET ";
    const updateValues = [];

    if (firstName) {
      updateQuery += "firstName = ?, ";
      updateValues.push(firstName);
    }
    if (lastName) {
      updateQuery += "lastName = ?, ";
      updateValues.push(lastName);
    }
    if (age) {
      updateQuery += "age = ?, ";
      updateValues.push(age);
    }
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateQuery += "password = ?, ";
      updateValues.push(hashedPassword);
    }

    updateQuery = updateQuery.slice(0, -2);
    updateQuery += " WHERE email = ?";
    updateValues.push(req.user.email);

    await connection.execute(updateQuery, updateValues);
    await connection.release();

    res.json({ message: "User updated successfully" });
  } catch (error) {
    if (connection) await connection.release();
    console.error("Update user error:", error);
    res.status(500).json({ error: error.message || "Failed to update user" });
  }
});

app.post("/api/auth/logout", authenticateToken, (req, res) => {
  res.json({ message: "Logged out successfully" });
});

app.get("/products", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [products] = await connection.execute(
      "SELECT * FROM products WHERE visible = TRUE OR visible IS NULL"
    );
    await connection.release();
    res.json(products);
  } catch (error) {
    if (connection) await connection.release();
    console.error("Fetch products error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/products/:id", async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    const [products] = await connection.execute(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );
    await connection.release();

    if (products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(products[0]);
  } catch (error) {
    if (connection) await connection.release();
    console.error("Fetch product error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/products/filter", async (req, res) => {
  let connection;
  try {
    const { category, instock, minPrice, maxPrice, sort } = req.query;

    let query = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    if (instock !== undefined) {
      query += " AND instock = ?";
      params.push(instock === "true" ? 1 : 0);
    }

    if (minPrice) {
      query += " AND price >= ?";
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += " AND price <= ?";
      params.push(parseFloat(maxPrice));
    }

    if (sort === "price_asc") {
      query += " ORDER BY price ASC";
    } else if (sort === "price_desc") {
      query += " ORDER BY price DESC";
    }

    connection = await pool.getConnection();
    const [products] = await connection.execute(query, params);
    await connection.release();
    res.json(products);
  } catch (error) {
    if (connection) await connection.release();
    console.error("Filter products error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/products/search", async (req, res) => {
  let connection;
  try {
    const { name } = req.query;

    connection = await pool.getConnection();

    if (!name) {
      const [products] = await connection.execute("SELECT * FROM products");
      await connection.release();
      return res.json(products);
    }

    const [products] = await connection.execute(
      "SELECT * FROM products WHERE name LIKE ?",
      [`%${name}%`]
    );
    await connection.release();
    res.json(products);
  } catch (error) {
    if (connection) await connection.release();
    console.error("Search products error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/products", async (req, res) => {
  let connection;
  try {
    const { name, category, price, instock, description, imageUrl } = req.body;

    if (!name || !category || price === undefined || instock === undefined) {
      return res.status(400).json({ error: "Missing required product fields" });
    }

    connection = await pool.getConnection();
    const [result] = await connection.execute(
      "INSERT INTO products (name, category, price, instock, description, image_url) VALUES (?, ?, ?, ?, ?, ?)",
      [name, category, price, instock ? 1 : 0, description, imageUrl]
    );
    await connection.release();

    res.status(201).json({ message: "Product added", id: result.insertId });
  } catch (error) {
    if (connection) await connection.release();
    console.error("Add product error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/products/:id", async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { name, category, price, instock, description, imageUrl } = req.body;

    connection = await pool.getConnection();

    let updateQuery = "UPDATE products SET ";
    const updateValues = [];

    if (name !== undefined) {
      updateQuery += "name = ?, ";
      updateValues.push(name);
    }
    if (category !== undefined) {
      updateQuery += "category = ?, ";
      updateValues.push(category);
    }
    if (price !== undefined) {
      updateQuery += "price = ?, ";
      updateValues.push(price);
    }
    if (instock !== undefined) {
      updateQuery += "instock = ?, ";
      updateValues.push(instock ? 1 : 0);
    }
    if (description !== undefined) {
      updateQuery += "description = ?, ";
      updateValues.push(description);
    }
    if (imageUrl !== undefined) {
      updateQuery += "image_url = ?, ";
      updateValues.push(imageUrl);
    }

    if (updateValues.length === 0) {
      await connection.release();
      return res.status(400).json({ error: "No fields to update" });
    }

    updateQuery = updateQuery.slice(0, -2);
    updateQuery += " WHERE id = ?";
    updateValues.push(id);

    await connection.execute(updateQuery, updateValues);
    await connection.release();

    res.json({ message: "Product updated" });
  } catch (error) {
    if (connection) await connection.release();
    console.error("Update product error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/products/:id", async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.execute("DELETE FROM products WHERE id = ?", [id]);
    await connection.release();
    res.json({ message: "Product deleted" });
  } catch (error) {
    if (connection) await connection.release();
    console.error("Delete product error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/wishlist", authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [req.user.email]
    );

    if (users.length === 0) {
      await connection.release();
      return res.status(404).json({ error: "User not found" });
    }

    const userId = users[0].id;

    const [wishlist] = await connection.execute(
      `SELECT p.* FROM products p
       INNER JOIN wishlists w ON p.id = w.productId
       WHERE w.userId = ?`,
      [userId]
    );

    await connection.release();
    res.json(wishlist);
  } catch (error) {
    if (connection) await connection.release();
    console.error("Get wishlist error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch wishlist" });
  }
});

app.post("/api/wishlist", authenticateToken, async (req, res) => {
  let connection;
  try {
    const { productId } = req.body;

    connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [req.user.email]
    );

    if (users.length === 0) {
      await connection.release();
      return res.status(404).json({ error: "User not found" });
    }

    const userId = users[0].id;

    const [existing] = await connection.execute(
      "SELECT * FROM wishlists WHERE userId = ? AND productId = ?",
      [userId, productId]
    );

    if (existing.length > 0) {
      await connection.release();
      return res.status(400).json({ error: "Already in wishlist" });
    }

    await connection.execute(
      "INSERT INTO wishlists (userId, productId) VALUES (?, ?)",
      [userId, productId]
    );

    await connection.release();
    res.status(201).json({ message: "Added to wishlist" });
  } catch (error) {
    if (connection) await connection.release();
    console.error("Add to wishlist error:", error);
    res.status(500).json({ error: error.message || "Failed to add to wishlist" });
  }
});

app.delete("/api/wishlist/:productId", authenticateToken, async (req, res) => {
  let connection;
  try {
    const { productId } = req.params;

    connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [req.user.email]
    );

    if (users.length === 0) {
      await connection.release();
      return res.status(404).json({ error: "User not found" });
    }

    const userId = users[0].id;

    await connection.execute(
      "DELETE FROM wishlists WHERE userId = ? AND productId = ?",
      [userId, productId]
    );

    await connection.release();
    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    if (connection) await connection.release();
    console.error("Remove from wishlist error:", error);
    res.status(500).json({ error: error.message || "Failed to remove from wishlist" });
  }
});

app.get("/api/payment-methods", authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [req.user.email]
    );

    if (users.length === 0) {
      await connection.release();
      return res.status(404).json({ error: "User not found" });
    }

    const userId = users[0].id;

    const [methods] = await connection.execute(
      "SELECT id, cardHolder, card_number, expiry_month, expiry_year, is_default FROM payment_methods WHERE userId = ?",
      [userId]
    );

    await connection.release();
    res.json(methods);
  } catch (error) {
    if (connection) await connection.release();
    console.error("Get payment methods error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch payment methods" });
  }
});

app.post("/api/payment-methods", authenticateToken, async (req, res) => {
  let connection;
  try {
    const { cardNumber, cardHolder, expiryMonth, expiryYear, cvv } = req.body;

    connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [req.user.email]
    );

    if (users.length === 0) {
      await connection.release();
      return res.status(404).json({ error: "User not found" });
    }

    const userId = users[0].id;

    await connection.execute(
      "INSERT INTO payment_methods (userId, card_number, cardHolder, expiry_month, expiry_year, cvv) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, cardNumber, cardHolder, expiryMonth, expiryYear, cvv]
    );

    await connection.release();
    res.status(201).json({ message: "Payment method added" });
  } catch (error) {
    if (connection) await connection.release();
    console.error("Add payment method error:", error);
    res.status(500).json({ error: error.message || "Failed to add payment method" });
  }
});

app.delete("/api/payment-methods/:id", authenticateToken, async (req, res) => {
  let connection;
  try {
    const { id } = req.params;

    connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [req.user.email]
    );

    if (users.length === 0) {
      await connection.release();
      return res.status(404).json({ error: "User not found" });
    }

    const userId = users[0].id;

    await connection.execute(
      "DELETE FROM payment_methods WHERE id = ? AND userId = ?",
      [id, userId]
    );

    await connection.release();
    res.json({ message: "Payment method deleted" });
  } catch (error) {
    if (connection) await connection.release();
    console.error("Delete payment method error:", error);
    res.status(500).json({ error: error.message || "Failed to delete payment method" });
  }
});

app.put("/api/payment-methods/:id/default", authenticateToken, async (req, res) => {
  let connection;
  try {
    const { id } = req.params;

    connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [req.user.email]
    );

    if (users.length === 0) {
      await connection.release();
      return res.status(404).json({ error: "User not found" });
    }

    const userId = users[0].id;

    await connection.execute(
      "UPDATE payment_methods SET is_default = 0 WHERE userId = ?",
      [userId]
    );

    await connection.execute(
      "UPDATE payment_methods SET is_default = 1 WHERE id = ? AND userId = ?",
      [id, userId]
    );

    await connection.release();
    res.json({ message: "Default payment method updated" });
  } catch (error) {
    if (connection) await connection.release();
    console.error("Update default error:", error);
    res.status(500).json({ error: error.message || "Failed to update default" });
  }
});

app.get("/api/purchase-history", authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [req.user.email]
    );

    if (users.length === 0) {
      await connection.release();
      return res.status(404).json({ error: "User not found" });
    }

    const userId = users[0].id;

    const [orders] = await connection.execute(
      `SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at, o.estimated_delivery
       FROM orders o
       WHERE o.userId = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    await connection.release();
    res.json(orders);
  } catch (error) {
    if (connection) await connection.release();
    console.error("Get purchase history error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch history" });
  }
});

app.get("/api/purchase-history/:id", authenticateToken, async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [req.user.email]
    );

    if (users.length === 0) {
      await connection.release();
      return res.status(404).json({ error: "User not found" });
    }

    const userId = users[0].id;

    const [orders] = await connection.execute(
      "SELECT * FROM orders WHERE id = ? AND userId = ?",
      [id, userId]
    );

    if (orders.length === 0) {
      await connection.release();
      return res.status(404).json({ error: "Order not found" });
    }

    const [items] = await connection.execute(
      "SELECT * FROM order_items WHERE orderId = ?",
      [id]
    );

    await connection.release();

    res.json({
      order: orders[0],
      items,
    });
  } catch (error) {
    if (connection) await connection.release();
    console.error("Get order error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch order" });
  }
});

app.post("/orders", authenticateToken, async (req, res) => {
  let connection;
  try {
    const { order, items } = req.body;

    if (!order || !items || items.length === 0) {
      return res.status(400).json({ error: "Missing order data" });
    }

    connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT id, email, firstName FROM users WHERE email = ?",
      [req.user.email]
    );

    if (users.length === 0) {
      await connection.release();
      return res.status(404).json({ error: "User not found" });
    }

    const userId = users[0].id;
    const user = users[0];

    const [orderResult] = await connection.execute(
      "INSERT INTO orders (userId, order_number, total_amount, subtotal, shipping_cost, estimated_delivery, delivery_address, delivery_city, delivery_postal_code, delivery_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        order.order_number,
        order.total_amount,
        order.subtotal,
        order.shipping_cost,
        order.estimated_delivery,
        order.delivery_address,
        order.delivery_city,
        order.delivery_postal_code,
        order.delivery_phone,
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.execute(
        "INSERT INTO order_items (orderId, productId, quantity, price, product_name) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price, item.product_name]
      );
    }

    await connection.release();

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const emailHtml = `
        <h2>Order Confirmation</h2>
        <p>Hi ${user.firstName},</p>
        <p>Order #: <strong>${order.order_number}</strong></p>
        <p>Total: $${order.total_amount}</p>
        <p>Thank you for your order!</p>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Order Confirmation - ${order.order_number}`,
        html: emailHtml,
      });
    } catch (emailError) {
      console.warn("Email send failed:", emailError);
    }

    res.status(201).json({ message: "Order created successfully", orderId });
  } catch (error) {
    if (connection) await connection.release();
    console.error("Create order error:", error);
    res.status(500).json({ error: error.message || "Failed to create order" });
  }
});

app.post("/orders/guest", async (req, res) => {
  let connection;
  try {
    const { customer, order, items } = req.body;

    console.log("Guest order received:", { customer, order, itemCount: items?.length });

    if (!customer || !order || !items || items.length === 0) {
      return res.status(400).json({ error: "Missing order data" });
    }

    connection = await pool.getConnection();

    const guestUserId = 1;

    const [orderResult] = await connection.execute(
      `INSERT INTO orders (userId, order_number, total_amount, subtotal, shipping_cost, estimated_delivery, delivery_address, delivery_city, delivery_postal_code, delivery_phone, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        guestUserId,
        order.order_number,
        order.total_amount,
        order.subtotal,
        order.shipping_cost,
        order.estimated_delivery,
        order.delivery_address || customer.address || '',
        order.delivery_city || '',
        order.delivery_postal_code || '',
        order.delivery_phone || customer.phone || '',
        order.status || 'Processing'
      ]
    );

    const orderId = orderResult.insertId;
    console.log("Order created with ID:", orderId);

    for (const item of items) {
      await connection.execute(
        "INSERT INTO order_items (orderId, productId, quantity, price, product_name) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.product_id || 1, item.quantity, item.price, item.product_name]
      );
    }

    await connection.release();

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: customer.email,
          subject: `Order Confirmation - ${order.order_number}`,
          html: `<h2>Order Confirmation</h2><p>Thank you for your order!</p><p>Order #: ${order.order_number}</p><p>Total: Rs. ${order.total_amount}</p>`,
        });
      }
    } catch (emailError) {
      console.warn("Email send failed (non-critical):", emailError.message);
    }

    res.status(201).json({ 
      success: true,
      message: "Order created successfully", 
      orderId,
      orderNumber: order.order_number
    });
  } catch (error) {
    if (connection) await connection.release();
    console.error("Guest order error:", error);
    res.status(500).json({ error: error.message || "Failed to create order" });
  }
});

app.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const [admins] = await pool.execute(
      "SELECT * FROM admins WHERE username = ?",
      [username]
    );

    if (admins.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = admins[0];
    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { 
        adminId: admin.id, 
        username: admin.username,
        isAdmin: true 
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log(`Admin login successful: ${username}`);
    
    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username
      },
      expiresIn: "24h"
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/admin/create", authenticateAdmin, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters" });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM admins WHERE username = ?",
      [username]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO admins (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: { id: result.insertId, username }
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ error: "Failed to create admin" });
  }
});

app.get("/admin/verify", authenticateAdmin, (req, res) => {
  res.json({ 
    valid: true, 
    admin: { 
      id: req.admin.adminId, 
      username: req.admin.username 
    } 
  });
});

app.get("/admin/orders", authenticateAdmin, async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT 
        o.id, o.order_number, o.total_amount, o.subtotal, o.shipping_cost,
        o.status, o.estimated_delivery, o.delivery_address, o.delivery_city,
        o.delivery_postal_code, o.delivery_phone, o.created_at,
        u.firstName, u.lastName, u.email,
        CONCAT(u.firstName, ' ', u.lastName) as customer_name
      FROM orders o
      LEFT JOIN users u ON o.userId = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.get("/admin/orders/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [orders] = await pool.execute(`
      SELECT o.*, u.firstName, u.lastName, u.email
      FROM orders o
      LEFT JOIN users u ON o.userId = u.id
      WHERE o.id = ?
    `, [id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    const [items] = await pool.execute(`
      SELECT oi.*, p.name as product_name, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.productId = p.id
      WHERE oi.orderId = ?
    `, [id]);
    
    res.json({ ...orders[0], items });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

app.put("/admin/orders/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['Processing', 'Being Packaged', 'On Route', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    await pool.execute("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "Order status updated", status });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

app.post("/admin/upload", authenticateAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    
    res.json({ 
      success: true,
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

app.get("/admin/products", authenticateAdmin, async (req, res) => {
  try {
    const [products] = await pool.execute("SELECT * FROM products ORDER BY id DESC");
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/admin/products", authenticateAdmin, async (req, res) => {
  try {
    const { name, category, price, description, image_url, in_stock, visible } = req.body;
    
    if (!name || !category || price === undefined) {
      return res.status(400).json({ error: "Name, category, and price are required" });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO products (name, category, price, description, image_url, in_stock, visible) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, category, price, description || '', image_url || '', in_stock !== false, visible !== false]
    );
    
    const [newProduct] = await pool.execute("SELECT * FROM products WHERE id = ?", [result.insertId]);
    res.status(201).json(newProduct[0]);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.put("/admin/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const allowedFields = ['name', 'category', 'price', 'description', 'image_url', 'in_stock', 'visible'];
    const updateFields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }
    
    values.push(id);
    await pool.execute(`UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`, values);
    
    const [updatedProduct] = await pool.execute("SELECT * FROM products WHERE id = ?", [id]);
    res.json(updatedProduct[0]);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/admin/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM products WHERE id = ?", [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   ☕ Sattarbaksh Server Running       ║
║   Server: http://localhost:${PORT}     ║
║   Database: MySQL (${process.env.DB_NAME})         ║
╚════════════════════════════════════════╝
  `);
});
