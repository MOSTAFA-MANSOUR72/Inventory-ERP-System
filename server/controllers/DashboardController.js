const Product = require("../models/Product");
const InventoryProduct = require("../models/InventoryProduct");
const Contract = require("../models/Contract");
const Provider = require("../models/Provider");
const Receipt = require("../models/Receipt");
const Branch = require("../models/Branch");
const catchAsync = require("../utils/catchAsync");

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const { role, _id: userId, branch: userBranch } = req.user;
  const stats = {};

  // For Date calculations (Today)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  if (role === "admin") {
    // Admin Stats
    stats.totalProducts = await Product.countDocuments();
    stats.lowStockCount = await InventoryProduct.countDocuments({ quantity: { $lt: 10 } });
    stats.totalContracts = await Contract.countDocuments();
    stats.totalSuppliers = await Provider.countDocuments();
    stats.pendingContracts = await Contract.countDocuments({ status: "pending" });
    
    // Admin sees total sales today across all branches
    const todaySalesData = await Receipt.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: "completed"
    });
    stats.todaySales = todaySalesData.reduce((sum, r) => sum + r.totalAmount, 0);

  } else if (role === "manager") {
    // Manager Stats (for branches they manage)
    const managedBranches = await Branch.find({ manager: userId }).select("_id");
    const branchIds = managedBranches.map((b) => b._id);

    stats.totalProducts = await InventoryProduct.countDocuments({ branch: { $in: branchIds } });
    stats.lowStockCount = await InventoryProduct.countDocuments({ 
      branch: { $in: branchIds }, 
      quantity: { $lt: 10 } 
    });
    stats.totalContracts = await Contract.countDocuments({ branch: { $in: branchIds } });
    stats.totalSuppliers = await Provider.countDocuments({ manager: userId });
    stats.pendingContracts = await Contract.countDocuments({ 
      branch: { $in: branchIds }, 
      status: "pending" 
    });

    const todaySalesData = await Receipt.find({
      branch: { $in: branchIds },
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: "completed"
    });
    stats.todaySales = todaySalesData.reduce((sum, r) => sum + r.totalAmount, 0);

  } else if (role === "cashier") {
    // Cashier Stats (for their assigned branch)
    if (!userBranch) {
      stats.todaySales = 0;
      stats.openOrders = 0;
    } else {
      const todaySalesData = await Receipt.find({
        branch: userBranch,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: "completed"
      });
      stats.todaySales = todaySalesData.reduce((sum, r) => sum + r.totalAmount, 0);
      
      // Open Orders for cashier = Pending contracts for their branch
      stats.openOrders = await Contract.countDocuments({
        branch: userBranch,
        status: "pending"
      });
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});
