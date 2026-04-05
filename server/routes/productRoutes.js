const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} = require("../controllers/ProductController");

const { protect, restrictTo } = require("../controllers/authController");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "../public/images");
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Create product (protected) - only manager and admin can create
router.post("/", protect, restrictTo("manager", "admin"), upload.single("image"), createProduct);

// Get all products (protected) - all authenticated users can read
// Filters data based on user role: admin sees all, manager sees their own, cashier sees assigned manager's products
router.get("/", protect, getAllProducts);

// Get single product (protected) - all authenticated users can read
// Filters data based on user role and manager relationship
router.get("/:id", protect, getProductById);

// Update product (protected) - only manager and admin can update
router.patch("/:id", protect, restrictTo("manager", "admin"), upload.single("image"), updateProduct);

// Delete product (protected) - only manager and admin can delete
router.delete("/:id", protect, restrictTo("manager", "admin"), deleteProduct);

module.exports = router;
