const User = require("../models/User");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync"); 

exports.createUser = catchAsync(async (req, res, next) => {
  let { name, email, password, confirmPassword, role, branch } = req.body;
  let manager;

  if (req.user.role === "manager") {
    role = "cashier"; // Force role to cashier if the requester is a manager
    manager = req.user._id; // Set the manager field to the ID of the requester
  } else {
    branch = undefined; // Ensure branch is not set if the requester is not a manager
    manager = undefined; // Ensure manager is not set if the requester is not a manager
  }

  const newUser = await User.create({ name, email, password, confirmPassword, role, branch, manager });

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
})

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const users = await User.find().skip(skip).limit(parseInt(limit)).sort('-createdAt');
  const total = await User.countDocuments();

  res.status(200).json({
    status: "success",
    results: users.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      users,
    },
  });
})

exports.getAllUsersByManager = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const users = await User.find({ manager: req.user._id }).skip(skip).limit(parseInt(limit)).sort('-createdAt');
  const total = await User.countDocuments({ manager: req.user._id });

  res.status(200).json({
    status: "success",
    results: users.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: {
      users,
    },
  });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError(`User Not Found with id : ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    status: "success",
    data: {
      user
    },
  });
})

exports.updateUser = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after', // return the updated document instead of the original
    runValidators: true // run schema validators on the update operation
  });

  if (!updatedUser) {
    return next(new AppError(`User Not Found with id : ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
})

exports.deleteUser = catchAsync(async (req, res, next) => {
  let user;

  if (req.user.role === "manager") {
    user = await User.findByIdAndDelete({ _id: req.params.id, manager: req.user._id });
  } else {
    user = await User.findByIdAndDelete(req.params.id);
  }

  if (!user) {
    return next(new AppError(`User Not Found with id : ${req.params.id}`, 404));
  }

  res.status(204).json({
    status: "success",
    message: "User deleted successfully",
  });
});