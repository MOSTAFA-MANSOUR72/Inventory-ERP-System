const express = require("express")
const router = express.Router();

const { signup, login, forgotPassword, resetPassword, protect, updatePassword, refreshToken, getMe } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/refreshToken", refreshToken);

// Protected routes
router.get("/me", protect, getMe);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/updateMyPassword", protect, updatePassword);

module.exports = router;