const Joi = require('joi')
const { password } = require('./custom.validation')

/** Register */
const register = {
    body: Joi.object().keys({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().required().custom(password),
        device_token: Joi.string().optional().trim(),
        device_id: Joi.string().optional().trim(),
        device_type: Joi.string().optional().trim(),
    }),
}

/** Verify OTP */
const verifyOtp = {
    body: Joi.object().keys({
        email: Joi.string().email().required().trim(),
        otp: Joi.string().required().trim(),
    }),
}

/** Login */
const login = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
        device_token: Joi.string().optional().trim(),
        device_id: Joi.string().optional().trim(),
        device_type: Joi.string().optional().trim(),
    }),
}

/** Logout */
const logout = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};

/** Send OTP */
const sendOtp = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
    }),
};

/** Reset Password */
const resetPassword = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required().custom(password),
    }),
};

module.exports = {
    register,
    verifyOtp,
    login,
    logout,
    resetPassword,
    sendOtp
}
