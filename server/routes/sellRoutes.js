const express = require("express");
const router = express.Router();

const {
  createSale,
  getAllReceipts,
  getReceiptById,
  getBranchSalesSummary,
  getDailySalesReport,
  getTopSellingProducts,
  refundReceipt,
} = require("../controllers/SellController");

const { protect, restrictTo } = require("../controllers/authController");

// All sell routes require authentication
router.use(protect);

// Cashier only routes
router.use(restrictTo("cashier"));

// Create a sale/receipt
router.post("/", createSale);

// Get all receipts for the branch
router.get("/", getAllReceipts);

// Get sales summary for the branch
router.get("/summary", getBranchSalesSummary);

// Get daily sales report
router.get("/daily-report", getDailySalesReport);

// Get top selling products
router.get("/top-products", getTopSellingProducts);

// Get single receipt
router.get("/:id", getReceiptById);

// Process refund/return
router.patch("/:id/refund", refundReceipt);

module.exports = router;
