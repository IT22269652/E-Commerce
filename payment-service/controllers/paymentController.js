const mongoose = require('mongoose');
const Payment = require('../models/Payment');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const validMethods = ['CARD', 'WALLET', 'BANK_TRANSFER', 'CASH'];
const validStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

const validatePaymentValues = ({ method, status }) => {
  if (method !== undefined && !validMethods.includes(method)) {
    return { field: 'method', valid: validMethods };
  }
  if (status !== undefined && !validStatuses.includes(status)) {
    return { field: 'status', valid: validStatuses };
  }
  return null;
};

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments
 *     responses:
 *       200:
 *         description: List of all payments
 */
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment found
 *       404:
 *         description: Payment not found
 */
exports.getPayment = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid payment ID' });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * @swagger
 * /payments/order/{orderId}:
 *   get:
 *     summary: Get payments by order ID
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payments for the requested order
 *       404:
 *         description: No payments found for this order
 */
exports.getPaymentsByOrderId = async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    if (Number.isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const payments = await Payment.find({ orderId });
    if (!payments.length) {
      return res.status(404).json({ message: 'No payments found for this order ID' });
    }
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * @swagger
 * /payments/order/{orderId}:
 *   put:
 *     summary: Update payment(s) by order ID
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *                 enum:
 *                   - PENDING
 *                   - PAID
 *                   - FAILED
 *                   - REFUNDED
 *               currency:
 *                 type: string
 *                 example: USD
 *               method:
 *                 type: string
 *                 enum:
 *                   - CARD
 *                   - WALLET
 *                   - BANK_TRANSFER
 *                   - CASH
 *     responses:
 *       200:
 *         description: Payment(s) updated
 *       404:
 *         description: No payments found for this order ID
 */
exports.updatePaymentsByOrderId = async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    if (Number.isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const { status, currency, method } = req.body;
    const invalid = validatePaymentValues({ method, status });
    if (invalid) {
      return res.status(400).json({
        message: `Invalid payment ${invalid.field}`,
        allowed: invalid.valid,
      });
    }

    const update = {};
    if (status !== undefined) update.status = status;
    if (currency !== undefined) update.currency = currency;
    if (method !== undefined) update.method = method;

    if (!Object.keys(update).length) {
      return res.status(400).json({ message: 'At least one field must be provided to update' });
    }

    const payments = await Payment.updateMany({ orderId }, update, { runValidators: true });
    if (!payments.matchedCount) {
      return res.status(404).json({ message: 'No payments found for this order ID' });
    }

    const updatedPayments = await Payment.find({ orderId });
    res.json(updatedPayments);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', error: err.message });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * @swagger
 * /payments/order/{orderId}:
 *   delete:
 *     summary: Delete payment(s) by order ID
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment(s) deleted
 *       404:
 *         description: No payments found for this order ID
 */
exports.deletePaymentsByOrderId = async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    if (Number.isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const result = await Payment.deleteMany({ orderId });
    if (!result.deletedCount) {
      return res.status(404).json({ message: 'No payments found for this order ID' });
    }
    res.json({ message: `${result.deletedCount} payment(s) deleted for order ID ${orderId}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

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
 *                 example: USD
 *               method:
 *                 type: string
 *                 enum:
 *                   - CARD
 *                   - WALLET
 *                   - BANK_TRANSFER
 *                   - CASH
 *               status:
 *                 type: string
 *                 enum:
 *                   - PENDING
 *                   - PAID
 *                   - FAILED
 *                   - REFUNDED
 *     responses:
 *       201:
 *         description: Payment created successfully
 */
exports.createPayment = async (req, res) => {
  try {
    const { orderId, amount, currency, method, status } = req.body;
    const numericOrderId = parseInt(orderId, 10);
    const numericAmount = parseFloat(amount);

    if (orderId === undefined || Number.isNaN(numericOrderId) || numericOrderId <= 0) {
      return res.status(400).json({ message: 'orderId is required and must be a valid number' });
    }

    if (amount === undefined || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'amount is required and must be a valid number' });
    }

    const invalid = validatePaymentValues({ method, status });
    if (invalid) {
      return res.status(400).json({
        message: `Invalid payment ${invalid.field}`,
        allowed: invalid.valid,
      });
    }

    const payment = new Payment({
      orderId: numericOrderId,
      amount: numericAmount,
      currency: currency || 'USD',
      method: method || 'CARD',
      status: status || 'PENDING',
    });

    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', error: err.message });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * @swagger
 * /payments/{id}:
 *   put:
 *     summary: Update an existing payment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                 example: USD
 *               method:
 *                 type: string
 *                 enum:
 *                   - CARD
 *                   - WALLET
 *                   - BANK_TRANSFER
 *                   - CASH
 *               status:
 *                 type: string
 *                 enum:
 *                   - PENDING
 *                   - PAID
 *                   - FAILED
 *                   - REFUNDED
 *     responses:
 *       200:
 *         description: Payment updated
 *       404:
 *         description: Payment not found
 */
exports.updatePayment = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid payment ID' });
    }

    const { orderId, amount, currency, method, status } = req.body;
    const invalid = validatePaymentValues({ method, status });
    if (invalid) {
      return res.status(400).json({
        message: `Invalid payment ${invalid.field}`,
        allowed: invalid.valid,
      });
    }

    const updated = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        ...(orderId !== undefined && { orderId: parseInt(orderId, 10) }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(currency !== undefined && { currency }),
        ...(method !== undefined && { method }),
        ...(status !== undefined && { status }),
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Payment not found' });
    res.json(updated);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', error: err.message });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

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
 *           type: string
 *     responses:
 *       200:
 *         description: Payment deleted successfully
 *       404:
 *         description: Payment not found
 */
exports.deletePayment = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid payment ID' });
    }

    const deleted = await Payment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
