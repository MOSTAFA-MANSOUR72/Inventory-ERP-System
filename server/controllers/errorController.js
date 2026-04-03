const AppError = require("../utils/appError");

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]; // extract the duplicate value from the error message using regex
  const message = `Duplicate field value : ${value}. Please use another value!`;
  return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message); // extract the validation error messages from the error object
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
}

const handleJWTError = () => {
  return new AppError("Invalid token. Please log in again!", 401);
}

const handleTokenExpiredError = () => {
  return new AppError("Token expired. Please log in again!", 401);
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err }; // create a shallow copy of the error object to avoid mutating the original error
  
  if(err.name === "CastError") error = handleCastErrorDB(err);
  if(err.code === 11000) error = handleDuplicateFieldsDB(err);
  if(err.name === "ValidationError") error = handleValidationErrorDB(err); // handle mongoose validation error except for unique validation error which is handled by handleDuplicateFieldsDB
  if(err.name === "JsonWebTokenError") error = handleJWTError();
  if(err.name === "TokenExpiredError") error = handleTokenExpiredError();

  error.message = error.message || err.message || "Something went wrong!"; // ensure that the error message is set correctly, even for custom errors created in the error handling functions

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    name: err.name
  })
}