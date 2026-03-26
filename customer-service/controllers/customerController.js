const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTER ---
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, addresses, cards } = req.body;

    // Check if user already exists
    const existingUser = await Customer.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const customer = await Customer.create({ 
      name, 
      email, 
      password: hashedPassword, 
      phone,
      addresses, // Expecting array of {type, line1, city}
      cards      // Expecting array of {cardNumber, expiry, cardHolder}
    });

    res.status(201).json({ 
      message: "User created successfully", 
      userId: customer._id 
    });
  } catch (err) { 
    res.status(400).json({ error: err.message }); 
  }
};

// --- LOGIN ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Customer.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
      // Create JWT with User ID as payload
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      res.json({ 
        token, 
        user: { id: user._id, name: user.name, email: user.email } 
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- GET PROFILE ---
exports.getProfile = async (req, res) => {
  try {
    const user = await Customer.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: "Customer not found" });
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- UPDATE PROFILE ---
exports.updateProfile = async (req, res) => {
  try {
    // SECURITY: Ensure the user ID in the JWT matches the ID in the URL
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Forbidden: You cannot update someone else's profile" });
    }

    // Optional: If password is being updated, hash it before saving
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await Customer.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true } // runValidators ensures the 2-card limit is respected
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: "Customer not found" });

    res.json({ message: "Profile updated", data: updatedUser });
  } catch (err) { 
    res.status(400).json({ error: err.message }); 
  }
};

// --- DELETE ---
exports.deleteCustomer = async (req, res) => {
  try {
    // SECURITY: Ensure the user ID in the JWT matches the ID in the URL
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Forbidden: You cannot delete someone else's profile" });
    }

    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Customer not found" });

    res.json({ message: "Customer account successfully deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};