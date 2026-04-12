const Contract = require("../models/Contract");
const InventoryProduct = require("../models/InventoryProduct");
const Product = require("../models/Product");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Create a new contract for purchasing products
exports.createContract = catchAsync(async (req, res, next) => {
  const { branch, products, paymentMethod, expectedDeliveryDate, description } = req.body;
  const managerId = req.user.manager;

  // Validate required fields
  if (!branch || !products || products.length === 0) {
    return next(new AppError("Please provide branch, and at least one product", 400));
  }

  // Validate products - ensure they belong to the current manager
  let totalAmount = 0;
  const contractProducts = [];

  for (const item of products) {
    const product = await Product.findById(item.product);

    if (!product) {
      return next(new AppError(`Product with ID ${item.product} not found`, 404));
    }

    // Verify product belongs to the current manager
    if (product.manager.toString() !== managerId.toString()) {
      return next(new AppError(`Product ${product.name} does not belong to you`, 403));
    }

    if (!item.quantity || !item.buyPrice || !item.sellPrice) {
      return next(new AppError("Each product must have quantity, buyPrice, and sellPrice", 400));
    }

    const subtotal = item.quantity * item.buyPrice;
    totalAmount += subtotal;

    contractProducts.push({
      product: item.product,
      quantity: item.quantity,
      buyPrice: item.buyPrice,
      sellPrice: item.sellPrice,
      subtotal: subtotal,
    });
  }

  // Create contract
  const contract = await Contract.create({
    branch,
    manager: managerId,
    products: contractProducts,
    status: "pending",
    paymentStatus: "unpaid",
    totalQuantity: contractProducts.reduce((sum, p) => sum + p.quantity, 0),
    totalAmount,
    paymentMethod,
    expectedDeliveryDate,
    description,
  });

  // Populate references
  const populatedContract = await contract.populate([
    { path: "branch", select: "name location" },
    { path: "manager", select: "name email" },
    { path: "products.product", select: "name category" },
    { path: "products.provider", select: "name email phone" },
  ]);

  res.status(201).json({
    status: "success",
    data: {
      contract: populatedContract,
    },
  });
});

// Get all contracts for the current manager
exports.getContracts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, branch } = req.query;
  const skip = (page - 1) * limit;
  let query = {};

  if (req.user.role === 'cashier') {
    query.branch = req.user.branch;
  } else if (req.user.role === 'manager') {
    query.manager = req.user._id;
  }
  // Admin sees everything if no filters applied

  if (status) {
    query.status = status;
  }

  if (branch && req.user.role !== 'cashier') {
    query.branch = branch;
  }

  const contracts = await Contract.find(query)
    .populate("branch", "name location")
    .populate("manager", "name email")
    .populate("products.product", "name category")
    .populate("products.provider", "name email phone")
    .skip(skip)
    .limit(parseInt(limit))
    .sort("-createdAt");

  const total = await Contract.countDocuments(query);

  res.status(200).json({
    status: "success",
    results: contracts.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      contracts,
    },
  });
});

// Get single contract by ID
exports.getContractById = catchAsync(async (req, res, next) => {
  const contract = await Contract.findById(req.params.id)
    .populate("branch", "name location")
    .populate("manager", "name email")
    .populate("products.product", "name description category")
    .populate("products.provider", "name email phone");

  if (!contract) {
    return next(new AppError("No contract found with that ID", 404));
  }

  // Verify access permissions
  const isOwner = contract.manager.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  const isBranchCashier = req.user.role === "cashier" && contract.branch._id.toString() === req.user.branch.toString();

  if (!isOwner && !isAdmin && !isBranchCashier) {
    return next(new AppError("You do not have permission to view this contract", 403));
  }

  res.status(200).json({
    status: "success",
    data: {
      contract,
    },
  });
});

// Update contract (only if status is pending)
exports.updateContract = catchAsync(async (req, res, next) => {
  const { products, paymentMethod, expectedDeliveryDate, description, paymentStatus } = req.body;

  const contract = await Contract.findById(req.params.id);

  if (!contract) {
    return next(new AppError("No contract found with that ID", 404));
  }

  // Verify ownership
  if (contract.manager.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new AppError("You do not have permission to update this contract", 403));
  }

  // Only allow updates if status is pending
  if (contract.status !== "pending") {
    return next(new AppError("Can only update contracts with pending status", 400));
  }

  // If products are being updated, recalculate totals
  if (products && products.length > 0) {
    const managerId = req.user._id;
    let totalAmount = 0;
    const contractProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.product);

      if (!product) {
        return next(new AppError(`Product with ID ${item.product} not found`, 404));
      }

      // Verify product belongs to the current manager
      if (product.manager.toString() !== managerId.toString()) {
        return next(new AppError(`Product ${product.name} does not belong to you`, 403));
      }

      if (!item.quantity || !item.buyPrice || !item.sellPrice) {
        return next(new AppError("Each product must have quantity, buyPrice, and sellPrice", 400));
      }

      const subtotal = item.quantity * item.buyPrice;
      totalAmount += subtotal;

      contractProducts.push({
        product: item.product,
        quantity: item.quantity,
        buyPrice: item.buyPrice,
        sellPrice: item.sellPrice,
        subtotal: subtotal,
      });
    }

    contract.products = contractProducts;
    contract.totalAmount = totalAmount;
    contract.totalQuantity = contractProducts.reduce((sum, p) => sum + p.quantity, 0);
  }

  // Update optional fields
  if (paymentMethod) contract.paymentMethod = paymentMethod;
  if (expectedDeliveryDate) contract.expectedDeliveryDate = expectedDeliveryDate;
  if (description) contract.description = description;
  if (paymentStatus) contract.paymentStatus = paymentStatus;

  await contract.save();

  const updatedContract = await contract.populate([
    { path: "branch", select: "name location" },
    { path: "manager", select: "name email" },
    { path: "products.product", select: "name category" },
    { path: "products.provider", select: "name email phone" },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      contract: updatedContract,
    },
  });
});

// Approve contract and mark as completed
exports.approveContract = catchAsync(async (req, res, next) => {
  const { deliveryDate } = req.body;
  const contract = await Contract.findById(req.params.id);

  if (!contract) {
    return next(new AppError("No contract found with that ID", 404));
  }

  // Verify ownership or admin
  if (contract.manager.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new AppError("You do not have permission to approve this contract", 403));
  }

  // Update contract status
  contract.status = "completed";
  contract.deliveryDate = deliveryDate || new Date();
  contract.approvedBy = req.user._id;
  contract.approvalDate = new Date();
  await contract.save();

  // Create inventory products for each item in the contract
  // Note: Each product creates a NEW inventory instance (not updating existing)
  for (const contractProduct of contract.products) {
    await InventoryProduct.create({
      product: contractProduct.product,
      quantity: contractProduct.quantity,
      buyPrice: contractProduct.buyPrice,
      sellPrice: contractProduct.sellPrice,
      branch: contract.branch,
    });
  }

  const approvedContract = await contract.populate([
    { path: "branch", select: "name location" },
    { path: "manager", select: "name email" },
    { path: "approvedBy", select: "name email" },
    { path: "products.product", select: "name category" },
    { path: "products.provider", select: "name email phone" },
  ]);

  res.status(200).json({
    status: "success",
    message: "Contract approved and inventory items created",
    data: {
      contract: approvedContract,
    },
  });
});

// Delete contract (only if pending)
exports.deleteContract = catchAsync(async (req, res, next) => {
  const contract = await Contract.findById(req.params.id);

  if (!contract) {
    return next(new AppError("No contract found with that ID", 404));
  }

  // Verify ownership
  if (contract.manager.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new AppError("You do not have permission to delete this contract", 403));
  }

  // Only allow deletion if status is pending
  if (contract.status !== "pending") {
    return next(new AppError("Can only delete contracts with pending status", 400));
  }

  await Contract.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Cancel contract (mark as cancelled)
exports.cancelContract = catchAsync(async (req, res, next) => {
  const contract = await Contract.findById(req.params.id);

  if (!contract) {
    return next(new AppError("No contract found with that ID", 404));
  }

  // Verify ownership
  if (contract.manager.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new AppError("You do not have permission to cancel this contract", 403));
  }

  // Only allow cancellation if not already completed
  if (contract.status === "completed") {
    return next(new AppError("Cannot cancel a completed contract", 400));
  }

  contract.status = "cancelled";
  await contract.save();

  const cancelledContract = await contract.populate([
    { path: "branch", select: "name location" },
    { path: "manager", select: "name email" },
    { path: "products.product", select: "name category" },
    { path: "products.provider", select: "name email phone" },
  ]);

  res.status(200).json({
    status: "success",
    message: "Contract cancelled successfully",
    data: {
      contract: cancelledContract,
    },
  });
});
