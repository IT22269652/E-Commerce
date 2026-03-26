const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  type: { type: String, enum: ['Home', 'Office'], required: true },
  line1: String,
  city: String
});

const CardSchema = new mongoose.Schema({
  cardNumber: String,
  expiry: String,
  cardHolder: String
});

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // For Login
  phone: String,
  addresses: [AddressSchema], // Array to hold Home/Office
  cards: {
    type: [CardSchema],
    validate: [v => v.length <= 2, 'Maximum 2 cards allowed']
  }
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);