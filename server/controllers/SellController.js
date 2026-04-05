const Receipt = require("../models/Receipt");
const InventoryProduct = require("../models/InventoryProduct");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Create a receipt for a sale
exports.createSale = catchAsync(async (req, res, next) => {
  const { items, paymentMethod, notes } = req.body;
  const cashierId = req.user._id;

  // Get cashier's branch from user (assuming cashier has branch assigned)
  const branch = req.user.branch;

  if (!branch) {
    return next(new AppError("Cashier must be assigned to a branch", 400));
  }

  if (!items || items.length === 0) {
    return next(new AppError("Please provide at least one item to sell", 400));
  }

  if (!paymentMethod) {
    return next(new AppError("Please specify payment method", 400));
  }

  // Validate and process items
  let totalAmount = 0;
  let totalCost = 0;
  const receiptItems = [];

  for (const item of items) {
    const inventoryProduct = await InventoryProduct.findById(item.inventoryProduct);

    if (!inventoryProduct) {
      return next(new AppError(`Inventory product with ID ${item.inventoryProduct} not found`, 404));
    }

    // Verify inventory belongs to same branch
    if (inventoryProduct.branch.toString() !== branch.toString()) {
      return next(new AppError("Cannot sell products from different branches", 400));
    }

    // Check if quantity is available
    if (item.quantity > inventoryProduct.quantity) {
      return next(
        new AppError(
          `Insufficient quantity for product. Available: ${inventoryProduct.quantity}, Requested: ${item.quantity}`,
          400
        )
      );
    }

    const buyPrice = inventoryProduct.buyPrice;
    const sellPrice = inventoryProduct.sellPrice;
    const quantity = item.quantity;

    const subtotal = sellPrice * quantity;
    const itemCost = buyPrice * quantity;
    const itemProfit = (sellPrice - buyPrice) * quantity;

    totalAmount += subtotal;
    totalCost += itemCost;

    receiptItems.push({
      inventoryProduct: item.inventoryProduct,
      quantity,
      buyPrice,
      sellPrice,
      subtotal,
      profit: itemProfit,
    });

    // Deduct from inventory
    inventoryProduct.quantity -= quantity;
    await inventoryProduct.save();
  }

  const totalProfit = totalAmount - totalCost;
  const profitMargin = (totalProfit / totalAmount) * 100;

  const receipt = await Receipt.create({
    receiptNumber: `R-${Date.now()}`,
    cashier: cashierId,
    branch,
    items: receiptItems,
    totalQuantitySold: receiptItems.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount,
    totalCost,
    totalProfit,
    profitMargin,
    paymentMethod,
    notes,
    status: "completed",
  });

  // Populate references
  const populatedReceipt = await receipt.populate([
    { path: "cashier", select: "name email role" },
    { path: "branch", select: "name location" },
    { path: "items.inventoryProduct", select: "product quantity" },
  ]);

  res.status(201).json({
    status: "success",
    data: {
      receipt: populatedReceipt,
    },
  });
});

// Get all receipts for the cashier's branch
exports.getAllReceipts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, startDate, endDate, paymentMethod, status } = req.query;
  const skip = (page - 1) * limit;
  const branch = req.user.branch;

  let query = { branch };

  if (paymentMethod) {
    query.paymentMethod = paymentMethod;
  }

  if (status) {
    query.status = status;
  }

  // Date range filtering
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  const receipts = await Receipt.find(query)
    .populate("cashier", "name email")
    .populate("branch", "name location")
    .populate("items.inventoryProduct", "product quantity")
    .skip(skip)
    .limit(parseInt(limit))
    .sort("-createdAt");

  const total = await Receipt.countDocuments(query);

  res.status(200).json({
    status: "success",
    results: receipts.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      receipts,
    },
  });
});

// Get single receipt by ID
exports.getReceiptById = catchAsync(async (req, res, next) => {
  const receipt = await Receipt.findById(req.params.id)
    .populate("cashier", "name email role")
    .populate("branch", "name location")
    .populate("items.inventoryProduct", "product quantity buyPrice sellPrice");

  if (!receipt) {
    return next(new AppError("Receipt not found", 404));
  }

  // Verify cashier can only view receipts from their branch
  if (receipt.branch._id.toString() !== req.user.branch.toString()) {
    return next(new AppError("You can only view receipts from your branch", 403));
  }

  res.status(200).json({
    status: "success",
    data: {
      receipt,
    },
  });
});

// Get branch sales summary
exports.getBranchSalesSummary = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const branch = req.user.branch;

  let query = { branch, status: "completed" };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  const receipts = await Receipt.find(query);

  if (receipts.length === 0) {
    return res.status(200).json({
      status: "success",
      data: {
        summary: {
          totalSales: 0,
          totalReceipts: 0,
          totalProfit: 0,
          averageProfitMargin: 0,
          totalItemsSold: 0,
        },
      },
    });
  }

  const summary = {
    totalSales: receipts.reduce((sum, r) => sum + r.totalAmount, 0),
    totalReceipts: receipts.length,
    totalProfit: receipts.reduce((sum, r) => sum + r.totalProfit, 0),
    averageProfitMargin:
      receipts.reduce((sum, r) => sum + r.profitMargin, 0) / receipts.length,
    totalItemsSold: receipts.reduce((sum, r) => sum + r.totalQuantitySold, 0),
    totalCost: receipts.reduce((sum, r) => sum + r.totalCost, 0),
  };

  res.status(200).json({
    status: "success",
    data: {
      summary,
      dateRange: {
        start: startDate || "all time",
        end: endDate || "all time",
      },
    },
  });
});

// Get daily sales report
exports.getDailySalesReport = catchAsync(async (req, res, next) => {
  const { date } = req.query;
  const branch = req.user.branch;

  if (!date) {
    return next(new AppError("Please provide a date (YYYY-MM-DD)", 400));
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const receipts = await Receipt.find({
    branch,
    status: "completed",
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })
    .populate("cashier", "name email")
    .populate("items.inventoryProduct", "product");

  const dailySummary = {
    date,
    totalReceipts: receipts.length,
    totalSales: receipts.reduce((sum, r) => sum + r.totalAmount, 0),
    totalProfit: receipts.reduce((sum, r) => sum + r.totalProfit, 0),
    totalItemsSold: receipts.reduce((sum, r) => sum + r.totalQuantitySold, 0),
    averageProfitMargin:
      receipts.length > 0
        ? receipts.reduce((sum, r) => sum + r.profitMargin, 0) / receipts.length
        : 0,
    salesByCashier: {},
    paymentMethodBreakdown: {},
  };

  // Group by cashier
  receipts.forEach((receipt) => {
    const cashierName = receipt.cashier.name;
    if (!dailySummary.salesByCashier[cashierName]) {
      dailySummary.salesByCashier[cashierName] = {
        receipts: 0,
        sales: 0,
        profit: 0,
      };
    }
    dailySummary.salesByCashier[cashierName].receipts += 1;
    dailySummary.salesByCashier[cashierName].sales += receipt.totalAmount;
    dailySummary.salesByCashier[cashierName].profit += receipt.totalProfit;
  });

  // Group by payment method
  receipts.forEach((receipt) => {
    const method = receipt.paymentMethod;
    if (!dailySummary.paymentMethodBreakdown[method]) {
      dailySummary.paymentMethodBreakdown[method] = {
        count: 0,
        amount: 0,
      };
    }
    dailySummary.paymentMethodBreakdown[method].count += 1;
    dailySummary.paymentMethodBreakdown[method].amount += receipt.totalAmount;
  });

  res.status(200).json({
    status: "success",
    data: {
      report: dailySummary,
    },
  });
});

// Get top selling products
exports.getTopSellingProducts = catchAsync(async (req, res, next) => {
  const { limit = 10, startDate, endDate } = req.query;
  const branch = req.user.branch;

  let matchStage = { "branch": branch, "status": "completed" };

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) {
      matchStage.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      matchStage.createdAt.$lte = new Date(endDate);
    }
  }

  const topProducts = await Receipt.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.inventoryProduct",
        totalQuantity: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.subtotal" },
        totalProfit: { $sum: "$items.profit" },
        salesCount: { $sum: 1 },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: parseInt(limit) },
    {
      $lookup: {
        from: "inventoryproducts",
        localField: "_id",
        foreignField: "_id",
        as: "inventoryProduct",
      },
    },
    { $unwind: "$inventoryProduct" },
    {
      $lookup: {
        from: "products",
        localField: "inventoryProduct.product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
  ]);

  res.status(200).json({
    status: "success",
    results: topProducts.length,
    data: {
      topProducts,
    },
  });
});

// Issue refund - refunds complete receipt
exports.refundReceipt = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  const receipt = await Receipt.findById(req.params.id);

  if (!receipt) {
    return next(new AppError("Receipt not found", 404));
  }

  // Verify authorization - cashier can only refund receipts from their branch
  if (receipt.branch.toString() !== req.user.branch?.toString()) {
    return next(new AppError("You can only refund receipts from your branch", 403));
  }

  // Check if already refunded
  if (receipt.status === "refunded") {
    return next(new AppError("This receipt has already been refunded", 400));
  }

  // Return all items to inventory
  for (const receiptItem of receipt.items) {
    const inventoryProduct = await InventoryProduct.findById(
      receiptItem.inventoryProduct
    );

    if (inventoryProduct) {
      // Add the sold quantity back to inventory
      inventoryProduct.quantity += receiptItem.quantity;
      await inventoryProduct.save();
    }
  }

  // Leave a note of the refund reason and mark receipt as refunded
  receipt.status = "refunded";
  receipt.notes = `Refunded: ${reason || "No reason provided"}`;

  await receipt.save();

  const updatedReceipt = await receipt.populate([
    { path: "cashier", select: "name email" },
    { path: "branch", select: "name location" },
  ]);

  res.status(200).json({
    status: "success",
    message: "Receipt fully refunded and inventory restored",
    data: {
      receipt: updatedReceipt,
    },
  });
});
