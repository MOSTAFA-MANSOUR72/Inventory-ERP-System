const Branch = require('../models/Branch');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createBranch = catchAsync(async (req, res, next) => {
    const { name, location } = req.body;
    const managerId = req.user._id;
    

    if (!name || !location) {
        return next(new AppError("Please provide name and location for the branch", 400));
    }

    const newBranch = await Branch.create({ name, location, manager: managerId });

    res.status(201).json({
        status: "success",
        data: {
            branch: newBranch,
        },
    });
});

exports.getAllBranches = catchAsync(async (req, res, next) => {
    const branches = await Branch.find();

    res.status(200).json({
        status: "success",
        results: branches.length,
        data: {
            branches,
        },
    });
});

exports.getBranchById = catchAsync(async (req, res, next) => {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
        return next(new AppError("No branch found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            branch,
        },
    });
});

exports.updateBranch = catchAsync(async (req, res, next) => {
    const { name, location } = req.body;

    const branch = await Branch.findById(req.params.id);
    
    if (!branch) {
        return next(new AppError("No branch found with that ID", 404));
    }
    const managerId = req.user._id.toString();

    if (branch.manager.toString() !== managerId && req.user.role !== "admin") {
        return next(new AppError("You do not have permission to update this branch", 403));
    }

    const updatedBranch = await Branch.findByIdAndUpdate(
        req.params.id,
        { name, location },
        { new: true, runValidators: true }
    );

    if (!updatedBranch) {
        return next(new AppError("No branch found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            branch: updatedBranch,
        },
    });
});

exports.getAllBranchesByManager = catchAsync(async (req, res, next) => {
    const managerId = req.user._id;
    const branches = await Branch.find({ manager: managerId });

    res.status(200).json({
        status: "success",
        results: branches.length,
        data: {
            branches,
        },
    });
});

exports.deleteBranch = catchAsync(async (req, res, next) => {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
        return next(new AppError("No branch found with that ID", 404));
    }
    
    const managerId = req.user._id.toString();
    if (branch.manager.toString() !== managerId && req.user.role !== "admin") {
        return next(new AppError("You do not have permission to delete this branch", 403));
    }

    await Branch.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: "success",
        data: null,
    });
});