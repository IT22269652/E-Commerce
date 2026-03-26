const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const customerController = require('./controllers/customerController');
const auth = require('./middleware/auth');

const app = express();

app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Customer Database Connected Successfully"))
  .catch(err => {
    console.error("❌ Database Connection Error:", err.message);
    // process.exit(1);
  });


//PUBLIC ROUTES
app.post('/register', customerController.register);
app.post('/login', customerController.login);

//PROTECTED ROUTES
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