const Receipt = require("../models/Receipt");
const Branch = require("../models/Branch");
const InventoryProduct = require("../models/InventoryProduct");
const Product = require("../models/Product");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

const getQueryDateRange = (startDate, endDate) => {
  const query = {};
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }
  return query;
};

// 1. Branch Detail Report
exports.getBranchReport = catchAsync(async (req, res, next) => {
  const { branchId } = req.params;
  const { startDate, endDate } = req.query;

  const dateQuery = getQueryDateRange(startDate, endDate);
  const matchStage = {
    branch: new mongoose.Types.ObjectId(branchId),
    status: "completed",
    ...dateQuery,
  };

  const stats = await Receipt.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalProfit: { $sum: "$totalProfit" },
        totalCost: { $sum: "$totalCost" },
        receiptsCount: { $sum: 1 },
        totalItemsSold: { $sum: "$totalQuantitySold" },
      },
    },
  ]);

  const paymentMethodBreakdown = await Receipt.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        amount: { $sum: "$totalAmount" },
      },
    },
  ]);

  const topProducts = await Receipt.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.inventoryProduct",
        quantity: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.subtotal" },
        profit: { $sum: "$items.profit" },
      },
    },
    { $sort: { quantity: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "inventoryproducts",
        localField: "_id",
        foreignField: "_id",
        as: "inventory",
      },
    },
    { $unwind: "$inventory" },
    {
      $lookup: {
        from: "products",
        localField: "inventory.product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        name: "$product.name",
        quantity: 1,
        revenue: 1,
        profit: 1,
      },
    },
  ]);

  const dailyTrend = await Receipt.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        profit: { $sum: "$totalProfit" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      summary: stats[0] || { totalRevenue: 0, totalProfit: 0, totalCost: 0, receiptsCount: 0, totalItemsSold: 0 },
      paymentMethodBreakdown,
      topProducts,
      dailyTrend,
    },
  });
});

// 2. Manager Overview (All Branches)
exports.getManagerOverview = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const userId = req.user._id;

  const managedBranches = await Branch.find({ manager: userId }).select("_id name");
  const branchIds = managedBranches.map((b) => b._id);

  const dateQuery = getQueryDateRange(startDate, endDate);
  const matchStage = {
    branch: { $in: branchIds },
    status: "completed",
    ...dateQuery,
  };

  const branchStats = await Receipt.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$branch",
        revenue: { $sum: "$totalAmount" },
        profit: { $sum: "$totalProfit" },
        receiptsCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "_id",
        foreignField: "_id",
        as: "branchInfo",
      },
    },
    { $unwind: "$branchInfo" },
    {
      $project: {
        name: "$branchInfo.name",
        revenue: 1,
        profit: 1,
        receiptsCount: 1,
      },
    },
  ]);

  const aggregateStats = await Receipt.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalProfit: { $sum: "$totalProfit" },
        receiptsCount: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      aggregate: aggregateStats[0] || { totalRevenue: 0, totalProfit: 0, receiptsCount: 0 },
      branchComparison: branchStats,
    },
  });
});

// 3. Products Ranking Report
exports.getProductsRanking = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const userId = req.user._id;

  // Assuming we only care about branches managed by this user
  const managedBranches = await Branch.find({ manager: userId }).select("_id");
  const branchIds = managedBranches.map((b) => b._id);

  const dateQuery = getQueryDateRange(startDate, endDate);
  const matchStage = {
    branch: { $in: branchIds },
    status: "completed",
    ...dateQuery,
  };

  const productRanking = await Receipt.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.inventoryProduct",
        totalQty: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.subtotal" },
        totalProfit: { $sum: "$items.profit" },
        branchIds: { $addToSet: "$branch" },
      },
    },
    {
      $lookup: {
        from: "inventoryproducts",
        localField: "_id",
        foreignField: "_id",
        as: "inv",
      },
    },
    { $unwind: "$inv" },
    {
      $group: {
        _id: "$inv.product",
        totalQty: { $sum: "$totalQty" },
        totalRevenue: { $sum: "$totalRevenue" },
        totalProfit: { $sum: "$totalProfit" },
        branchPerformance: { $push: { branch: "$inv.branch", qty: "$totalQty" } },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },
    {
      $lookup: {
        from: "categories",
        localField: "productInfo.category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
    { $sort: { totalRevenue: -1 } },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      ranking: productRanking,
    },
  });
});

// 4. Single Product Detail Report
exports.getProductDetailReport = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { startDate, endDate } = req.query;
  const userId = req.user._id;

  const managedBranches = await Branch.find({ manager: userId }).select("_id");
  const branchIds = managedBranches.map((b) => b._id);

  // First find all inventory entries for this product in user's branches
  const inventories = await InventoryProduct.find({
    product: productId,
    branch: { $in: branchIds },
  }).select("_id");
  const inventoryIds = inventories.map((i) => i._id);

  const dateQuery = getQueryDateRange(startDate, endDate);
  const matchStage = {
    status: "completed",
    "items.inventoryProduct": { $in: inventoryIds },
    ...dateQuery,
  };

  const branchBreakdown = await Receipt.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },
    { $match: { "items.inventoryProduct": { $in: inventoryIds } } },
    {
      $group: {
        _id: "$branch",
        qty: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.subtotal" },
        profit: { $sum: "$items.profit" },
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "_id",
        foreignField: "_id",
        as: "branchInfo",
      },
    },
    { $unwind: "$branchInfo" },
  ]);

  const timeTrend = await Receipt.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },
    { $match: { "items.inventoryProduct": { $in: inventoryIds } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%W", date: "$createdAt" } }, // Weekly breakdown
        revenue: { $sum: "$items.subtotal" },
        profit: { $sum: "$items.profit" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      branchBreakdown,
      timeTrend,
    },
  });
});
