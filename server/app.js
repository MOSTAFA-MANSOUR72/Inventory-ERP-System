const Express = require('express');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const AppErorr = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController');
const app = Express();

// Middleware
app.use(Express.json());

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