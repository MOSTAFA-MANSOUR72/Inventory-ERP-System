const Express = require('express');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const AppErorr = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController');
const app = Express();

// Middleware
app.use(Express.json());

const limmter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!"
});

app.use("/api", limmter);

app.use(Express.static(`${__dirname}/public`));

// Routes
app.use("/api", userRoutes);
app.use("/api", authRoutes);

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