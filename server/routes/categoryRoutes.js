const express = require('express');
const router = express.Router();
const { protect } = require('../controllers/authController');
const { restrictTo } = require('../controllers/authController');
const { createCategory, getAllCategories, updateCategory, deleteCategory } = require('../controllers/CategoryController');

router.route("/")
    .post(protect, restrictTo('admin'), createCategory)
    .get(protect, getAllCategories);

router.route("/:id")
    .put(protect, restrictTo('admin'), updateCategory)
    .delete(protect, restrictTo('admin'), deleteCategory);

module.exports = router;