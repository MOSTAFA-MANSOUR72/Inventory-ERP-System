const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Contract must be associated with a branch"],
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Contract must have a manager who created it"],
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Contract must include a product"],
        },
        quantity: {
          type: Number,
          required: [true, "Product quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
        buyPrice: {
          type: Number,
          required: [true, "Buy price is required"],
          min: [0, "Price must be a positive number"],
        },
        sellPrice: {
          type: Number,
          required: [true, "Sell price is required"],
          min: [0, "Price must be a positive number"],
        },
        subtotal: {
          type: Number,
        },
        provider: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Provider",
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    totalQuantity: {
      type: Number,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total must be positive"],
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "check", "credit", "bank_transfer"],
    },
    expectedDeliveryDate: Date,
    deliveryDate: Date,
    description: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvalDate: Date,
  },
  { timestamps: true }
);

const Contract = mongoose.model("Contract", contractSchema);

module.exports = Contract;