const express = require("express");
const router = express.Router();

const {
  createContract,
  getContracts,
  getContractById,
  updateContract,
  approveContract,
  deleteContract,
  cancelContract,
} = require("../controllers/ContractController");

const { protect, restrictTo } = require("../controllers/authController");

// All contract routes require authentication
router.use(protect);

// Create contract (manager/admin only)
router.post("/", createContract);

// Get all contracts for current manager
router.get("/", restrictTo("manager", "admin"), getContracts);

// Get single contract by ID
router.get("/:id", getContractById);

// Update contract (only pending contracts, manager/admin only)
router.patch("/:id", restrictTo("manager", "admin"), updateContract);

// Approve contract and create inventory items (manager/admin only)
router.patch("/:id/approve", restrictTo("manager", "admin"), approveContract);

// Cancel contract (manager/admin only)
router.patch("/:id/cancel", restrictTo("manager", "admin"), cancelContract);

// Delete contract (only pending contracts, manager/admin only)
router.delete("/:id", restrictTo("manager", "admin"), deleteContract);

module.exports = router;
