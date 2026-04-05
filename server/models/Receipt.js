const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
  {
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receipt must have a cashier"],
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Receipt must be associated with a branch"],
    },
    items: [
      {
        inventoryProduct: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryProduct",
          required: [true, "Receipt must include an inventory product"],
        },
        quantity: {
          type: Number,
          required: [true, "Item quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
        buyPrice: {
          type: Number,
          required: [true, "Buy price is required"],
          min: [0, "Buy price must be positive"],
        },
        sellPrice: {
          type: Number,
          required: [true, "Sell price is required"],
          min: [0, "Sell price must be positive"],
        },
        subtotal: {
          type: Number,
          // quantity * sellPrice
        },
        profit: {
          type: Number,
          // (sellPrice - buyPrice) * quantity
        },
      },
    ],
    totalQuantitySold: {
      type: Number,
      // Sum of all quantities
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total must be positive"],
    },
    totalCost: {
      type: Number,
      // Sum of (buyPrice * quantity) for all items
    },
    totalProfit: {
      type: Number,
      // totalAmount - totalCost
    },
    profitMargin: {
      type: Number,
      // (totalProfit / totalAmount) * 100
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "check", "bank_transfer"],
      required: [true, "Payment method is required"],
    },
    notes: String,
    status: {
      type: String,
      enum: ["completed", "returned", "refunded"],
      default: "completed",
    },
  },
  { timestamps: true }
);

const Receipt = mongoose.model("Receipt", receiptSchema);

module.exports = Receipt;
