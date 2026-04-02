const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const parseOrderId = (id) => {
  const parsed = parseInt(id, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

// ========== SWAGGER SETUP ==========
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
  apis: ['./index.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// In-memory data store (MVP)
let orders = [];

// ========== ROUTES ==========

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     responses:
 *       200:
 *         description: List of all orders
 */
app.get('/orders', (req, res) => {
  res.json(orders);
});

// -----------------------------------------

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get a single order by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order found
 *       404:
 *         description: Order not found
 */
app.get('/orders/:id', (req, res) => {
  const id = parseOrderId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: 'Invalid order ID' });
  }

  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  res.json(order);
});

// -----------------------------------------

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Order created successfully
 */
app.post('/orders', (req, res) => {
  const { productId, quantity } = req.body;

  if (productId === undefined || quantity === undefined) {
    return res.status(400).json({ message: 'productId and quantity are required' });
  }

  const newOrder = {
    id: orders.length + 1,
    productId,
    quantity,
    status: 'Pending',
    date: new Date().toISOString()
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// -----------------------------------------

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update order status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated
 *       404:
 *         description: Order not found
 */
app.put('/orders/:id', (req, res) => {
  const id = parseOrderId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: 'Invalid order ID' });
  }

  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = req.body.status || order.status;
  res.json(order);
});

// -----------------------------------------

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order deleted
 *       404:
 *         description: Order not found
 */
app.delete('/orders/:id', (req, res) => {
  const id = parseOrderId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: 'Invalid order ID' });
  }

  const index = orders.findIndex(o => o.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }

  orders.splice(index, 1);
  res.json({ message: 'Order deleted successfully' });
});

// ========== START SERVER ==========
app.listen(3003, () => {
  console.log('✅ Order Service running on http://localhost:3003');
  console.log('📄 Swagger Docs at http://localhost:3003/api-docs');
});