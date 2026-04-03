const express = require('express');
const router = express.Router();
const { protect } = require('../controllers/authController');
const {createUser, getAllUsers, getUserById, updateUser, deleteUser}  = require('../controllers/UserController');

router.route("/users")
    .post(createUser)
    .get(protect, getAllUsers);

router.route("/users/:id")
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;