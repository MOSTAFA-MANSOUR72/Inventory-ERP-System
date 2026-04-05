const Express = require('express');
const rateLimit = require('express-rate-limit');
const AppErorr = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController');
const helmet = require("helmet");

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const branchRoutes = require('./routes/branchRoutes');
const productRoutes = require('./routes/productRoutes');

const app = Express();

const limmter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!"
});

// Middleware
app.use(Express.json());
app.use("/api", limmter);

// Security headers
app.use(helmet());

app.use(Express.static(`${__dirname}/public`));

// Routes
app.use("/api", userRoutes);
app.use("/api", authRoutes);
app.use("/api", branchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});


// Not Found Route 
app.use((req, res, next) => {
  next(new AppErorr(`Can't find ${req.originalUrl} on this server!`, 404))
});


// Global Error Handling Middleware
app.use(globalErrorHandler);




module.exports = app;