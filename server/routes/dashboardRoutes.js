const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/DashboardController");
const { protect } = require("../controllers/authController");

router.use(protect);

router.get("/stats", dashboardController.getDashboardStats);

module.exports = router;
