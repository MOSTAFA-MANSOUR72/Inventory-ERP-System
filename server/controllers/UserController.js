const User = require("../models/User");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync"); 

exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword, role } = req.body;
  const newUser = await User.create({ name, email, password, confirmPassword, role });

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
})

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
})

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
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError(`User Not Found with id : ${req.params.id}`, 404));
  }

  res.status(204).json({
    status: "success",
    message: "User deleted successfully",
  });
})