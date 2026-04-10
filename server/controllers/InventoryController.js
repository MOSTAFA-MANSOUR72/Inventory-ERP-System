const InventoryProduct = require('../models/InventoryProduct');
const Branch = require('../models/Branch');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getInventoryProducts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  let filter = {};

  // Admin sees all inventory
  if (req.user.role === 'admin') {
    filter = {};
  } else if (req.user.role === 'cashier') {
    filter.branch = req.user.branch;
  } else if (req.user.role === 'manager') {
    let branches = await Branch.find({ manager: req.user._id }).select('_id');
    branches = branches.map((branch) => branch._id);
    if (branches.length > 0) {
      filter.branch = { $in: branches };
    } else {
      // Manager has no branches assigned
      return res.status(200).json({
        status: 'success',
        results: 0,
        total: 0,
        page: parseInt(page),
        pages: 0,
        data: {
          inventoryProducts: [],
        },
      });
    }
  }

  const inventoryProducts = await InventoryProduct.find(filter)
    .populate('product')
    .populate('branch')
    .skip(skip)
    .limit(parseInt(limit))
    .sort('-createdAt');

  const total = await InventoryProduct.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: inventoryProducts.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      inventoryProducts,
    },
  });
});

exports.getInventoryProduct = catchAsync(async (req, res, next) => {
  const inventoryProduct = await InventoryProduct.findById(req.params.id).populate('product').populate('branch');
  if (req.user.role === 'cashier' && inventoryProduct.branch._id.toString() !== req.user.branch.toString()) {
    return next(new AppError('You do not have permission to access this inventory product', 403));
  }
  if (req.user.role === 'manager') {
    let branches = await Branch.find({ manager: req.user._id }).select('_id');
    branches = branches.map((branch) => branch._id.toString());
    if (!branches.includes(inventoryProduct.branch._id.toString())) {
      return next(new AppError('You do not have permission to access this inventory product', 403));
    }
  }
  res.status(200).json({
    status: 'success',
    data: {
      inventoryProduct,
    },
  });
});

exports.updateInventory = catchAsync(async (req, res, next) => {
  const inventoryProduct = await InventoryProduct.findById(req.params.id);
  if (!inventoryProduct) {
    return next(new AppError('No inventory product found with that ID', 404));
  }
  if (req.user.role === 'cashier' && inventoryProduct.branch.toString() !== req.user.branch.toString()) {
    return next(new AppError('You do not have permission to update this inventory product', 403));
  }
  if (req.user.role === 'manager') {
    let branches = await Branch.find({ manager: req.user._id }).select('_id');
    branches = branches.map((branch) => branch._id.toString());
    if (!branches.includes(inventoryProduct.branch.toString())) {
      return next(new AppError('You do not have permission to update this inventory product', 403));
    }
  }
  const updatedInventoryProduct = await InventoryProduct.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      inventoryProduct: updatedInventoryProduct,
    },
  });
});

exports.deleteInventory = catchAsync(async (req, res, next) => {
  const inventoryProduct = await InventoryProduct.findById(req.params.id);
  if (!inventoryProduct) {
    return next(new AppError('No inventory product found with that ID', 404));
  }
  if (req.user.role === 'cashier' && inventoryProduct.branch.toString() !== req.user.branch.toString()) {
    return next(new AppError('You do not have permission to delete this inventory product', 403));
  }
  if (req.user.role === 'manager') {
    let branches = await Branch.find({ manager: req.user._id }).select('_id');
    branches = branches.map((branch) => branch._id.toString());
    if (!branches.includes(inventoryProduct.branch.toString())) {
      return next(new AppError('You do not have permission to delete this inventory product', 403));
    }
  }
  await InventoryProduct.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});