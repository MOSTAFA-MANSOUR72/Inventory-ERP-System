const mongoose = require("mongoose");

const InventoryProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Inventory product must reference a product"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    sellPrice: {
      type: Number,
      required: [true, "Product sell price is required"],
      min: [0, "Sell price cannot be negative"],
    },
    buyPrice: {
      type: Number,
      required: [true, "Product buy price is required"],
      min: [0, "Buy price cannot be negative"],
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Inventory product must be associated with a branch"],
    },
  },
  { timestamps: true }
);

const InventoryProduct = mongoose.model("InventoryProduct", InventoryProductSchema);

module.exports = InventoryProduct;