const Express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const AppErorr = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController');
const helmet = require("helmet");

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const branchRoutes = require('./routes/branchRoutes');
const productRoutes = require('./routes/productRoutes');
const providerRoutes = require('./routes/ProviderRoutes');
const contractRoutes = require('./routes/ContractRoutes');
const sellRoutes = require('./routes/sellRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = Express();

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : ['http://localhost:4200', 'http://127.0.0.1:4200'];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

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
app.use("/api/providers", providerRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/sales", sellRoutes);
app.use("/api/inventory", inventoryRoutes);

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