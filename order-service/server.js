const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const orderController = require('./controllers/orderController');

const app = express();
app.use(express.json());

// ========== SWAGGER ==========
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Order Service API',
      version: '1.0.0',
      description: 'Order microservice for E-Commerce platform',
    },
    servers: [{ url: 'http://localhost:3003' }],
  },
  apis: ['./controllers/orderController.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ========== DATABASE ==========
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Order Database Connected'))
  .catch(err => console.error('❌ DB Error:', err.message));

// ========== ROUTES ==========
app.get('/orders', orderController.getAllOrders);
app.get('/orders/:id', orderController.getOrder);
app.post('/orders', orderController.createOrder);
app.put('/orders/:id', orderController.updateOrder);
app.delete('/orders/:id', orderController.deleteOrder);

// ========== HEALTH ==========
app.get('/health', (req, res) => res.json({ status: 'UP' }));

// ========== START ==========
const PORT = process.env.ORDER_PORT || 3003;
app.listen(PORT, () => {
  console.log(`🚀 Order Service running on port ${PORT}`);
  console.log(`📄 Swagger: http://localhost:${PORT}/api-docs`);
});