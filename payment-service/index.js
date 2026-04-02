const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const paymentController = require('./controllers/paymentController');

const app = express();
app.use(cors());
app.use(express.json());

// ========== SWAGGER SETUP ==========
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Payment Service API',
      version: '1.0.0',
      description: 'Payment microservice for E-Commerce platform',
    },
    servers: [{ url: 'http://localhost:3004' }],
  },
  apis: ['./controllers/paymentController.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ========== DATABASE CONNECTION ==========
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not defined. Please add it to the root .env file.');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Payment Database Connected Successfully'))
  .catch(err => console.error('❌ Database Connection Error:', err.message));

// ========== ROUTES ==========
app.get('/payments', paymentController.getAllPayments);
app.get('/payments/:id', paymentController.getPayment);
app.get('/payments/order/:orderId', paymentController.getPaymentsByOrderId);
app.post('/payments', paymentController.createPayment);
app.put('/payments/:id', paymentController.updatePayment);
app.put('/payments/order/:orderId', paymentController.updatePaymentsByOrderId);
app.delete('/payments/:id', paymentController.deletePayment);
app.delete('/payments/order/:orderId', paymentController.deletePaymentsByOrderId);

app.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));

const PORT = process.env.PAYMENT_PORT || 3004;
app.listen(PORT, () => {
  console.log(`🚀 Payment Service active on port ${PORT}`);
  console.log(`📄 Swagger Dashboard: http://localhost:${PORT}/api-docs`);
});

