const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerUi = require('swagger-ui-express');

const app = express();

// ========== SWAGGER DOCUMENT ==========
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'E-Commerce API Gateway',
    version: '1.0.0',
    description: 'Central API Gateway — routes to all 5 microservices',
  },
  servers: [{ url: 'http://localhost:3000' }],
  paths: {

    // ── PRODUCTS ──────────────────────────────────────
    '/products': {
      get: {
        summary: 'Get all products',
        tags: ['Products'],
        responses: { 200: { description: 'OK' } },
      },
      post: {
        summary: 'Add new product with image',
        tags: ['Products'],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name', 'price', 'category', 'stock'],
                properties: {
                  name:     { type: 'string',  example: 'Laptop' },
                  price:    { type: 'number',  example: 1200 },
                  category: { type: 'string',  example: 'Electronics' },
                  stock:    { type: 'integer', example: 10 },
                  image:    { type: 'string',  format: 'binary' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/products/{id}': {
      get: {
        summary: 'Get product by ID',
        tags: ['Products'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '664f1b2c9e1a2b3c4d5e6f7a' }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
      },
      put: {
        summary: 'Update product',
        tags: ['Products'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name:     { type: 'string' },
                  price:    { type: 'number' },
                  category: { type: 'string' },
                  stock:    { type: 'integer' },
                  image:    { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
      },
      delete: {
        summary: 'Delete product',
        tags: ['Products'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 404: { description: 'Not found' } },
      },
    },

    // ── CUSTOMERS ─────────────────────────────────────
    '/customer/register': {
      post: {
        summary: 'Register new customer',
        tags: ['Customers'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name:     { type: 'string',  example: 'John Doe' },
                  email:    { type: 'string',  example: 'john@example.com' },
                  password: { type: 'string',  example: '123456' },
                  phone:    { type: 'string',  example: '0771234567' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Registered successfully' } },
      },
    },
    '/customer/login': {
      post: {
        summary: 'Customer login',
        tags: ['Customers'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email:    { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Login successful' } },
      },
    },
    '/customer/{id}': {
      get: {
        summary: 'Get customer profile',
        tags: ['Customers'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
      },
      put: {
        summary: 'Update customer profile',
        tags: ['Customers'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name:  { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        summary: 'Delete customer',
        tags: ['Customers'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },

    // ── ORDERS ────────────────────────────────────────
    '/orders': {
      get: {
        summary: 'Get all orders',
        tags: ['Orders'],
        responses: { 200: { description: 'OK' } },
      },
      post: {
        summary: 'Create new order',
        tags: ['Orders'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['customerId', 'productId', 'quantity'],
                properties: {
                  customerId: { type: 'string', example: '664f1b2c9e1a2b3c4d5e6f7a' },
                  productId:  { type: 'string', example: '664f1b2c9e1a2b3c4d5e6f7b' },
                  quantity:   { type: 'integer', example: 2 },
                  totalPrice: { type: 'number',  example: 2400 },
                  status:     { type: 'string',  example: 'pending' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/orders/{id}': {
      get: {
        summary: 'Get order by ID',
        tags: ['Orders'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
      },
      put: {
        summary: 'Update order status',
        tags: ['Orders'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'completed' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        summary: 'Delete order',
        tags: ['Orders'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },

    // ── PAYMENTS ──────────────────────────────────────
    '/payments': {
      get: {
        summary: 'Get all payments',
        tags: ['Payments'],
        responses: { 200: { description: 'OK' } },
      },
      post: {
        summary: 'Process new payment',
        tags: ['Payments'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orderId', 'amount'],
                properties: {
                  orderId: { type: 'string', example: '664f1b2c9e1a2b3c4d5e6f7c' },
                  amount:  { type: 'number', example: 2400 },
                  method:  { type: 'string', example: 'card' },
                  status:  { type: 'string', example: 'paid' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/payments/{id}': {
      get: {
        summary: 'Get payment by ID',
        tags: ['Payments'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
      },
      put: {
        summary: 'Update payment status',
        tags: ['Payments'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'refunded' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        summary: 'Delete payment',
        tags: ['Payments'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },

    // ── DELIVERIES ────────────────────────────────────
    '/deliveries': {
      get: {
        summary: 'Get all deliveries',
        tags: ['Deliveries'],
        responses: { 200: { description: 'OK' } },
      },
      post: {
        summary: 'Create new delivery',
        tags: ['Deliveries'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orderId', 'address'],
                properties: {
                  orderId:        { type: 'string', example: '664f1b2c9e1a2b3c4d5e6f7c' },
                  address:        { type: 'string', example: '123 Main St, Colombo' },
                  deliveryDate:   { type: 'string', example: '2026-04-10' },
                  status:         { type: 'string', example: 'pending' },
                  trackingNumber: { type: 'string', example: 'TRK-001' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/deliveries/{id}': {
      get: {
        summary: 'Get delivery by ID',
        tags: ['Deliveries'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
      },
      put: {
        summary: 'Update delivery status',
        tags: ['Deliveries'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status:         { type: 'string', example: 'delivered' },
                  trackingNumber: { type: 'string', example: 'TRK-002' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        summary: 'Delete delivery',
        tags: ['Deliveries'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },
  },
};

// ========== SWAGGER UI ==========
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ========== PROXY ROUTES ==========
// ✅ Only base URL in target — path is forwarded automatically
app.use('/products', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(503).json({ message: 'Product Service unavailable', error: err.message });
    },
  },
}));

app.use('/customer', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(503).json({ message: 'Customer Service unavailable', error: err.message });
    },
  },
}));

app.use('/orders', createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(503).json({ message: 'Order Service unavailable', error: err.message });
    },
  },
}));

app.use('/payments', createProxyMiddleware({
  target: 'http://localhost:3004',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(503).json({ message: 'Payment Service unavailable', error: err.message });
    },
  },
}));

app.use('/deliveries', createProxyMiddleware({
  target: 'http://localhost:3005',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(503).json({ message: 'Delivery Service unavailable', error: err.message });
    },
  },
}));

// ========== HEALTH CHECK ==========
app.get('/', (req, res) => {
  res.json({
    message: '✅ API Gateway is running!',
    swagger: 'http://localhost:3000/api-docs',
    routes: {
      products:   'http://localhost:3000/products',
      customers:  'http://localhost:3000/customer',
      orders:     'http://localhost:3000/orders',
      payments:   'http://localhost:3000/payments',
      deliveries: 'http://localhost:3000/deliveries',
    },
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API Gateway running on http://localhost:${PORT}`);
  console.log(`📄 Swagger UI at     http://localhost:${PORT}/api-docs`);
  console.log('\n📌 Routes:');
  console.log('   /products   → http://localhost:3001');
  console.log('   /customer   → http://localhost:3002');
  console.log('   /orders     → http://localhost:3003');
  console.log('   /payments   → http://localhost:3004');
  console.log('   /deliveries → http://localhost:3005');
});