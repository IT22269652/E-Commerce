// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const customerController = require('./controllers/customerController');
// const auth = require('./middleware/auth');

// const app = express();

// // --- Middleware ---
// app.use(express.json()); // Parses incoming JSON requests

// // --- Database Connection ---
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ Customer Database Connected Successfully"))
//   .catch(err => {
//     console.error("❌ Database Connection Error:", err.message);
//     process.exit(1); // Stop the server if DB fails
//   });

// // --- Routes Configuration ---

// /**
//  * PUBLIC ROUTES
//  * No token required for Registration or Login
//  */
// app.post('/register', customerController.register);
// app.post('/login', customerController.login);

// /**
//  * PROTECTED ROUTES
//  * The 'auth' middleware verifies the JWT before reaching the controller.
//  * These map to: /customer/:id via your API Gateway
//  */
// app.get('/:id', auth, customerController.getProfile);
// app.put('/:id', auth, customerController.updateProfile);
// app.delete('/:id', auth, customerController.deleteCustomer);

// // --- Health Check ---
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'Customer Service is UP' });
// });

// // --- Global Error Handler ---
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong on our end!' });
// });

// // --- Server Start ---
// const PORT = process.env.PORT || 3002;
// app.listen(PORT, () => {
//   console.log(`🚀 Customer Service active on port ${PORT}`);
//   console.log(`🔗 Linked to Gateway at http://localhost:3000/customer`);
// });







// 1. DNS FIX - Must be the very first thing to resolve Atlas SRV issues
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

// 2. LOAD ENVIRONMENT VARIABLES
require('dotenv').config();

// 3. IMPORTS
const express = require('express');
const mongoose = require('mongoose');
const customerController = require('./controllers/customerController');
const auth = require('./middleware/auth');

const app = express();

// --- Middleware ---
app.use(express.json()); // Essential for reading JSON from req.body

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Customer Database Connected Successfully"))
  .catch(err => {
    console.error("❌ Database Connection Error:", err.message);
    // process.exit(1); // Optional: Only uncomment if you want the app to crash on DB fail
  });

// --- Routes Configuration ---

/**
 * PUBLIC ROUTES
 * Anyone can access these to join or log in.
 */
app.post('/register', customerController.register);
app.post('/login', customerController.login);

/**
 * PROTECTED ROUTES
 * The 'auth' middleware verifies the JWT before reaching the controller.
 * These require an 'Authorization: Bearer <token>' header.
 */
app.get('/:id', auth, customerController.getProfile);
app.put('/:id', auth, customerController.updateProfile);
app.delete('/:id', auth, customerController.deleteCustomer);

// --- Health Check ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Customer Service is UP' });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on our end!' });
});

// --- Server Start ---
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Customer Service active on port ${PORT}`);
  console.log(`🔗 Linked to Gateway at http://localhost:3000/customer`);
});