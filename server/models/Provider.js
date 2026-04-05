const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Provider name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Provider phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Provider email is required"],
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provider must have a manager"],
    },
  },
  { timestamps: true }
);

const Provider = mongoose.model("Provider", providerSchema);

module.exports = Provider;