const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
    driver: {
      type: String,
      default: "Unassigned",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Delivery", deliverySchema);
