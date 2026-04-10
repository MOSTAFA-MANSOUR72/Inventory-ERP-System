const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createCategory = catchAsync(async (req, res, next) => {
    const { name } = req.body;

    if (!name) {
        return next(new AppError("Please provide a name for the category", 400));
    }

    const newCategory = await Category.create({ name });

    res.status(201).json({
        status: "success",
        data: {
            category: newCategory,
        },
    });
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const categories = await Category.find().skip(skip).limit(parseInt(limit)).sort('-createdAt');
    const total = await Category.countDocuments();

    res.status(200).json({
        status: "success",
        results: categories.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        data: {
            categories,
        },
    });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
    const { name } = req.body;

    const category = await Category.findById(req.params.id);
    
    if (!category) {
        return next(new AppError("No category found with that ID", 404));
    }

    category.name = name || category.name;
    await category.save();

    res.status(200).json({
        status: "success",
        data: { category },
    });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
        return next(new AppError("No category found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});