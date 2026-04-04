const express = require('express');
const router = express.Router();
const { protect } = require('../controllers/authController');
const { restrictTo } = require('../controllers/authController');
const { createBranch, getAllBranches, getBranchById, updateBranch, deleteBranch, getAllBranchesByManager } = require('../controllers/BranchController');

router.route("/branches/manager")
    .get(protect, restrictTo('manager'), getAllBranchesByManager);

router.route("/branches")
    .post(protect, restrictTo('admin', 'manager'), createBranch)
    .get(protect, restrictTo('admin', 'manager'), getAllBranches);

router.route("/branches/:id")
    .get(protect, getBranchById)
    .put(protect, restrictTo('admin', 'manager'), updateBranch)
    .delete(protect, restrictTo('admin', 'manager'), deleteBranch);

module.exports = router;