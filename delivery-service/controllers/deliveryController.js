const Delivery = require("../models/Delivery");

// READ: Get all deliveries
exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find();
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ: Get a single delivery by ID
exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery)
      return res.status(404).json({ message: "Delivery not found" });
    res.status(200).json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE: Add a new delivery
exports.createDelivery = async (req, res) => {
  try {
    const newDelivery = new Delivery({
      orderId: req.body.orderId,
      status: req.body.status,
      driver: req.body.driver,
    });
    const savedDelivery = await newDelivery.save();
    res.status(201).json(savedDelivery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE: Modify an existing delivery
exports.updateDelivery = async (req, res) => {
  try {
    const updatedDelivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }, // Returns the updated document
    );
    if (!updatedDelivery)
      return res.status(404).json({ message: "Delivery not found" });
    res.status(200).json(updatedDelivery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE: Remove a delivery
exports.deleteDelivery = async (req, res) => {
  try {
    const deletedDelivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!deletedDelivery)
      return res.status(404).json({ message: "Delivery not found" });
    res.status(200).json({ message: "Delivery deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
