const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const customerController = require('./controllers/customerController');
const auth = require('./middleware/auth');

const app = express();
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Customer API',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        CustomerRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
            phone: { type: 'string' }
          }
        }
      }
    },
  },
  apis: ['./controllers/customerController.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Customer Database Connected Successfully"))
  .catch(err => console.error("❌ Database Connection Error:", err.message));


// PUBLIC ROUTES
app.post('/customer/register', customerController.register);
app.post('/customer/login', customerController.login);

// PROTECTED ROUTES
app.get('/customer/:id', auth, customerController.getProfile);
app.put('/customer/:id', auth, customerController.updateProfile);
app.delete('/customer/:id', auth, customerController.deleteCustomer);

app.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));

const PORT = process.env.CUSTOMER_PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Customer Service active on port ${PORT}`);
  console.log(`📑 Swagger Dashboard: http://localhost:${PORT}/api-docs`);
});