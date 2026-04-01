const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { type: Number, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  method: {
    type: String,
    enum: ['CARD', 'WALLET', 'BANK_TRANSFER', 'CASH'],
    default: 'CARD',
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
