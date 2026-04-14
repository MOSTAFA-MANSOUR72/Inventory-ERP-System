const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/ReportsController");
const { protect, restrictTo } = require("../controllers/authController");

// All report routes require protection and at least manager role (some could be open to cashier for their own branch, but plan says Manager/Admin)
router.use(protect);
router.use(restrictTo("manager", "admin"));

// Branch Detail
router.get("/branch/:branchId", reportsController.getBranchReport);

// Manager Overview (All Branches managed by user)
router.get("/manager-overview", reportsController.getManagerOverview);

// Products Ranking
router.get("/products", reportsController.getProductsRanking);

// Single Product Detail
router.get("/products/:productId", reportsController.getProductDetailReport);

module.exports = router;
