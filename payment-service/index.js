const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());

// In-memory storage for MVP purposes.
let payments = [];

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
  apis: ['./index.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments
 *     responses:
 *       200:
 *         description: List of all payments
 */
app.get('/payments', (req, res) => {
  res.json(payments);
});

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get a single payment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment found
 *       404:
 *         description: Payment not found
 */
app.get('/payments/:id', (req, res) => {
  const payment = payments.find(p => p.id === parseInt(req.params.id, 10));
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.json(payment);
});

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a new payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - amount
 *             properties:
 *               orderId:
 *                 type: integer
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               method:
 *                 type: string
 *               status:
 *                 type: string
 *                 description: PENDING | PAID | FAILED
 *     responses:
 *       201:
 *         description: Payment created successfully
 */
app.post('/payments', (req, res) => {
  const { orderId, amount, currency, method, status } = req.body || {};

  const newPayment = {
    id: payments.length + 1,
    orderId: orderId !== undefined ? parseInt(orderId, 10) : null,
    amount: amount !== undefined ? parseFloat(amount) : 0,
    currency: currency || 'USD',
    method: method || 'CARD',
    status: status || 'PENDING',
  };

  payments.push(newPayment);
  res.status(201).json(newPayment);
});

/**
 * @swagger
 * /payments/{id}:
 *   put:
 *     summary: Update payment details
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
 *               orderId:
 *                 type: integer
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               method:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment updated
 *       404:
 *         description: Payment not found
 */
app.put('/payments/:id', (req, res) => {
  const index = payments.findIndex(p => p.id === parseInt(req.params.id, 10));
  if (index === -1) return res.status(404).json({ message: 'Payment not found' });

  const existing = payments[index];
  const { orderId, amount, currency, method, status } = req.body || {};

  const updatedPayment = {
    id: existing.id,
    orderId: orderId !== undefined ? parseInt(orderId, 10) : existing.orderId,
    amount: amount !== undefined ? parseFloat(amount) : existing.amount,
    currency: currency !== undefined ? currency : existing.currency,
    method: method !== undefined ? method : existing.method,
    status: status !== undefined ? status : existing.status,
  };

  payments[index] = updatedPayment;
  res.json(updatedPayment);
});

/**
 * @swagger
 * /payments/{id}:
 *   delete:
 *     summary: Delete a payment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment deleted
 *       404:
 *         description: Payment not found
 */
app.delete('/payments/:id', (req, res) => {
  const index = payments.findIndex(p => p.id === parseInt(req.params.id, 10));
  if (index === -1) return res.status(404).json({ message: 'Payment not found' });

  payments.splice(index, 1);
  res.json({ message: 'Payment deleted successfully' });
});

// ========== START SERVER ==========
app.listen(3004, () => {
  console.log('✅ Payment Service running on http://localhost:3004');
  console.log('📄 Swagger Docs at   http://localhost:3004/api-docs');
});

