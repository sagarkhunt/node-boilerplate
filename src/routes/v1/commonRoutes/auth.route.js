const express = require('express');
const { authController } = require('../../../controllers/commonControllers');
const validate = require('../../../middlewares/validate');
const { authValidation } = require('../../../validations');

const router = express.Router()

/** Register */
router.post('/register', validate(authValidation.register), authController.register);

/** Login */
router.post('/login', validate(authValidation.login), authController.login);

/** Logout */
router.post('/logout', validate(authValidation.logout), authController.logout);

/** Send OTP */
router.post('/send-otp', validate(authValidation.sendOtp), authController.sendOtp);

/** Verify OTP */
router.post('/verify-otp', validate(authValidation.verifyOtp), authController.verifyOtp);

/** Reset Password */
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);

module.exports = router
