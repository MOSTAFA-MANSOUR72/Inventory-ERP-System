const express = require("express")
const router = express.Router();

const { signup, login, forgotPassword, resetPassword, protect, updatePassword, refreshToken } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/refreshToken", refreshToken);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/updateMyPassword", protect, updatePassword);

module.exports = router;