const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const { createProvider, getAllProviders, getProviderById, updateProvider, deleteProvider } = require("../controllers/ProviderController");
const { protect, restrictTo } = require("../controllers/authController");

router.route("/")
  .post(protect, restrictTo("manager"), createProvider)
  .get(protect, getAllProviders);

router.route("/:id")
  .get(protect, getProviderById)
  .patch(protect, restrictTo("manager"), updateProvider)
  .delete(protect, restrictTo("manager"), deleteProvider);

module.exports = router;