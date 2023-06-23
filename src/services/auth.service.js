const httpStatus = require('http-status')
const userService = require('./user.service');
const { tokenTypes } = require('../config/tokens')
const { Token } = require('../models')
const ApiError = require('../utils/apiError')
const { translateResponseMessage } = require('../utils/functions')

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @param {Object} req
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (user, password, req) => {
    /** Check password are match with user's registered email. */
    if (!(await user.isPasswordMatch(password))) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            translateResponseMessage(req, 'wrong', 'password')
        )
    }

    return user
}

/**
 * Logout
 * @param {string} refreshToken
 * @param {Object} req
 * @returns {Promise}
 */
const logout = async (refreshToken, req) => {
    const refreshTokenDoc = await Token.findOne({
        token: refreshToken,
        type: tokenTypes.REFRESH,
        blacklisted: false,
    })
    if (!refreshTokenDoc) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            translateResponseMessage(req, 'wrong', 'password')
        )
    }
    await refreshTokenDoc.remove()
}

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (userId, password) => {
    return userService.updateUserById(userId, { password: password });
};

module.exports = {
    loginUserWithEmailAndPassword,
    logout,
    resetPassword
}
