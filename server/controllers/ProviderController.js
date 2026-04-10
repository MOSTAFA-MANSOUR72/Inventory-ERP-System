const Provider = require("../models/Provider");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Create a new provider
exports.createProvider = catchAsync(async (req, res, next) => {
  const { name, phone, email, address } = req.body;
  const managerId = req.user._id;

  if (!name || !phone || !email) {
    return next(new AppError("Please provide name, phone, and email", 400));
  }

  const newProvider = await Provider.create({
    name,
    phone,
    email,
    address,
    manager: managerId,
  });

  res.status(201).json({
    status: "success",
    data: {
      provider: newProvider,
    },
  });
});

// Get all providers frm the logged in manager or cashier's manager
exports.getAllProviders = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const userId = req.user._id;
  const userRole = req.user.role;
  const userManagerId = req.user.manager;

  let query = {};

  if (userRole === "manager") {
    query.manager = userId; // Managers see their own providers
  } else if (userRole === "cashier") {
    query.manager = userManagerId; // Cashiers see providers of their manager
  }

  const providers = await Provider.find(query).skip(skip).limit(parseInt(limit)).sort('-createdAt');
  const total = await Provider.countDocuments(query);

  res.status(200).json({
    status: "success",
    results: providers.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      providers,
    },
  });
});

// Get a single provider by ID
exports.getProviderById = catchAsync(async (req, res, next) => {
  const provider = await Provider.findById(req.params.id);

  if (!provider) {
    return next(new AppError("No provider found with that ID", 404));
  }

  // Check if the user has access to this provider
  if (
    req.user.role === "manager" &&
    provider.manager.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("You do not have permission to view this provider", 403));
  }

  if (
    req.user.role === "cashier" &&
    provider.manager.toString() !== req.user.manager.toString()
  ) {
    return next(new AppError("You do not have permission to view this provider", 403));
  }

  res.status(200).json({
    status: "success",
    data: {
      provider,
    },
  });
});

// Update a provider
exports.updateProvider = catchAsync(async (req, res, next) => {

  if (!provider) {
    return next(new AppError("No provider found with that ID", 404));
  }

  // Check if the user has access to update this provider
  if (provider.manager.toString() !== req.user._id.toString()) {
    return next(new AppError("You do not have permission to update this provider", 403));
  }

  const updatedProvider = await Provider.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      provider: updatedProvider,
    },
  });
});

// Delete a provider
exports.deleteProvider = catchAsync(async (req, res, next) => {
  const provider = await Provider.findById(req.params.id);

  if (!provider) {
    return next(new AppError("No provider found with that ID", 404));
  }

  // Check if the user has access to delete this provider
  if (provider.manager.toString() !== req.user._id.toString()) {
    return next(new AppError("You do not have permission to delete this provider", 403));
  }

  await Provider.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});