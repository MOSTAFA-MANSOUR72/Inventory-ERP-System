const app = require("./app.js");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Must be registered first — before any async code runs
process.on("uncaughtException", err => {
  console.error("Uncaught Exception! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

dotenv.config();

const PORT = process.env.PORT || 8000;

// Declare server at top scope so both handlers can reference it
let server;

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected to MongoDB ");
}).catch(error => {
  console.error("Error connecting to MongoDB:", error);
});

server = app.listen(PORT, () => {
  console.log(`Server is running on  http://localhost:${PORT}`);
});

process.on("unhandledRejection", err => {
  console.error("Unhandled Rejection! Shutting down...");
  console.error(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});