const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../controllers/authController');
const {createUser, getAllUsers, getUserById, getAllUsersByManager, updateUser, deleteUser}  = require('../controllers/UserController');

router.route("/users/manager")
    .get(protect, restrictTo('manager'), getAllUsersByManager);
    
router.route("/users")
    .post(protect, restrictTo("manager", "admin"), createUser)
    .get(protect, getAllUsers);

router.route("/users/:id")
    .get(protect, getUserById)
    .put(protect, restrictTo("manager", "admin"), updateUser)
    .delete(protect, restrictTo("manager", "admin"), deleteUser);

module.exports = router;