const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Initial dummy products if not exists
const defaultProducts = [
  { id: 1, name: "Ambraas Royal Oud Attar", price: 1499, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500", desc: "Pure organic oud formulation with 24hr longevity." },
  { id: 2, name: "Ambraas Velvet Rose Serum", price: 999, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500", desc: "Gold infused radiant skin serum." },
  { id: 3, name: "Ambraas Noir Beard Elixir", price: 799, image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500", desc: "Premium grooming oil with cedarwood extracts." }
];

function readJSON(file, defaultVal) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultVal, null, 2));
    return defaultVal;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return defaultVal;
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// APIs
app.get('/api/products', (req, res) => {
  const products = readJSON(PRODUCTS_FILE, defaultProducts);
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const products = readJSON(PRODUCTS_FILE, defaultProducts);
  const { name, price, image, desc } = req.body;
  const newProduct = {
    id: Date.now(),
    name,
    price: Number(price),
    image: image || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500",
    desc: desc || ""
  };
  products.push(newProduct);
  writeJSON(PRODUCTS_FILE, products);
  res.json({ success: true, product: newProduct });
});

app.delete('/api/products/:id', (req, res) => {
  let products = readJSON(PRODUCTS_FILE, defaultProducts);
  products = products.filter(p => p.id != req.params.id);
  writeJSON(PRODUCTS_FILE, products);
  res.json({ success: true });
});

app.get('/api/orders', (req, res) => {
  const orders = readJSON(ORDERS_FILE, []);
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const orders = readJSON(ORDERS_FILE, []);
  const newOrder = {
    id: 'AMB-' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toISOString(),
    ...req.body,
    status: 'Pending'
  };
  orders.unshift(newOrder);
  writeJSON(ORDERS_FILE, orders);
  res.json({ success: true, order: newOrder });
});

// Admin Route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`Ambraas Server Running on port ${PORT}`);
});
