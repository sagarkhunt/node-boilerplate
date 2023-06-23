const express = require('express');
const commonRoutes = require('./commonRoutes'); // common routes
const adminRoutes = require('./adminRoutes'); // admin routes
const userRoutes = require('./userRoutes'); // normal user routes

const router = express.Router();

/** Common routes */
router.use('/', commonRoutes);

/** Admin routes */
router.use('/admin', adminRoutes);

/** Normal user routes */
router.use('/users', userRoutes);

module.exports = router;
