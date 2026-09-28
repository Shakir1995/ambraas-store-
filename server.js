const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Public folder path fix
app.use(express.static(path.join(__dirname, 'public')));

let orders = [];

// Home route explicitly serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin page route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Order Placement API
app.post('/api/order', (req, res) => {
  const { name, phone, address, city, pincode, product, price, paymentMethod } = req.body;
  if (!name || !phone || !address || !pincode) {
    return res.status(400).json({ success: false, message: "Kripya sabhi details bharein!" });
  }

  const newOrder = {
    id: "AMB-" + (orders.length + 101),
    name,
    phone,
    address,
    city: city || "N/A",
    pincode,
    product,
    price,
    paymentMethod: paymentMethod || "Cash on Delivery (COD)",
    status: "Confirmed",
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  };

  orders.push(newOrder);
  console.log("✨ NAYA ORDER AAYA HAI - AMBRAAS ✨", newOrder);
  res.json({ success: true, order: newOrder });
});

// Track API
app.get('/api/track/:orderId', (req, res) => {
  const found = orders.find(o => o.id.toLowerCase() === req.params.orderId.trim().toLowerCase());
  if (found) {
    res.json({ success: true, order: found });
  } else {
    res.status(404).json({ success: false, message: "Order ID nahi mili!" });
  }
});

// My Orders API
app.get('/api/my-orders/:phone', (req, res) => {
  const customerOrders = orders.filter(o => o.phone.trim() === req.params.phone.trim());
  res.json({ success: true, orders: customerOrders });
});

// Admin APIs
app.get('/api/orders', (req, res) => res.json(orders));

app.post('/api/order/status', (req, res) => {
  const { id, status } = req.body;
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = status;
    res.json({ success: true, message: "Status updated" });
  } else {
    res.status(404).json({ success: false, message: "Order not found" });
  }
});

app.listen(3000, () => {
  console.log("Ambraas Store Server is Running: http://localhost:3000");
});
