const express = require("express");
const inventoryController = require("../controllers/InventoryController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(inventoryController.getInventoryProducts);
router
  .route("/:id")
  .get(inventoryController.getInventoryProduct)
  .patch(restrictTo("admin", "manager"), inventoryController.updateInventory)
  .delete(restrictTo("admin", "manager"), inventoryController.deleteInventory);

module.exports = router;
