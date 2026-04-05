const Product = require("../models/Product");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const fs = require("fs");
const path = require("path");

const uploadsDir = path.join(__dirname, "../public/images");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create Product with image upload
exports.createProduct = catchAsync(async (req, res, next) => {
  const { name, description, price, category } = req.body;
  const managerId = req.user._id;

  if (!name || !description || !price || !category) {
    return next(new AppError("Please provide name, description, price, and category", 400));
  }

  if (!req.file) {
    return next(new AppError("Please upload a product image", 400));
  }

  const imagePath = `/images/${req.file.filename}`;

  const newProduct = await Product.create({
    name,
    description,
    price,
    category,
    manager: managerId,
    image: imagePath,
  });

  res.status(201).json({
    status: "success",
    data: {
      product: newProduct,
    },
  });
});

// Get All Products with pagination, filtering by category id , and search by name or description
// Accessible by all authenticated users (cashier, manager, admin)
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, category, search } = req.query;
  const skip = (page - 1) * limit;

  const userId = req.user._id;
  const userRole = req.user.role;
  const userManagerId = req.user.manager;
  let query = {};

  // Filter products based on user role
  if (userRole === "admin") {
    // Admin can see all products
    // No filter needed
  } else if (userRole === "manager") {
    // Manager can see their own products
    query.manager = userId;
  } else if (userRole === "cashier") {
    // Cashier can see products from their assigned manager
    query.manager = userManagerId;
  }

  // Filter by category if provided
  if (category) {
    query.category = category;
  }

  // Search by name or description
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const products = await Product.find(query)
    .populate("category", "name")
    .populate("manager", "name")
    .skip(skip)
    .limit(parseInt(limit))
    .sort("-createdAt");

  const total = await Product.countDocuments(query);

  res.status(200).json({
    status: "success",
    results: products.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      products,
    },
  });
});

// Get Product by ID
// Accessible by all authenticated users - filtered by role and manager relationship
exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name")
    .populate("manager", "name");

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  // Check authorization based on user role and manager relationship
  const userId = req.user._id.toString();
  const userRole = req.user.role;
  const userManagerId = req.user.manager ? req.user.manager.toString() : null;
  const productManagerId = product.manager._id.toString();

  const isAuthorized =
    userRole === "admin" || // Admin can view all products
    productManagerId === userId || // Manager can view their own products
    (userRole === "cashier" && productManagerId === userManagerId); // Cashier can view products from their manager

  if (!isAuthorized) {
    return next(new AppError("You do not have permission to view this product", 403));
  }

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

// Update Product
exports.updateProduct = catchAsync(async (req, res, next) => {
  const { name, description, price, category } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  // Check authorization - only product manager or admin can update
  const managerId = req.user._id.toString();
  if (product.manager.toString() !== managerId && req.user.role !== "admin") {
    return next(new AppError("You do not have permission to update this product", 403));
  }

  // Handle image update if new image provided
  let imagePath = product.image;
  if (req.file) {
    // Delete old image if it exists
    const oldImagePath = path.join(__dirname, "..", "public", product.image);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
    imagePath = `/images/${req.file.filename}`;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      category: category || product.category,
      image: imagePath,
    },
    { new: true, runValidators: true }
  ).populate("category", "name")
    .populate("manager", "name email");

  res.status(200).json({
    status: "success",
    data: {
      product: updatedProduct,
    },
  });
});

// Delete Product
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  // Check authorization - only product manager or admin can delete
  const managerId = req.user._id.toString();
  if (product.manager.toString() !== managerId && req.user.role !== "admin") {
    return next(new AppError("You do not have permission to delete this product", 403));
  }

  // Delete image file
  const imagePath = path.join(__dirname, "..", "public", product.image);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
