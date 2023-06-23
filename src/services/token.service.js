const config = require('../config/config')
const httpStatus = require('http-status')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const { tokenTypes } = require('../config/tokens')
const { Token, Role } = require('../models')
const ApiError = require('../utils/apiError')
const { translateResponseMessage } = require('../utils/functions')
const { ROLES } = require('../utils/constant.helper')

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (
    userId,
    expires,
    type,
    role,
    secret = config.jwt.secret
) => {
    const payload = {
        sub: userId,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
        role,
    }
    return jwt.sign(payload, secret)
}

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
    const tokenDoc = await Token.findOneAndUpdate(
        { user: userId },
        {
            token,
            user: userId,
            expires: expires.toDate(),
            type,
            blacklisted,
        },
        { upsert: true, new: true }
    )
    return tokenDoc
}

/**
 * Generate 4 digit OTP.
 * @returns
 */
const generateOtp = () => {
    const otp = ('0'.repeat(4) + Math.floor(Math.random() * 10 ** 4)).slice(-4)
    return otp
}

/**
 * Store otp in token table for verify user.
 * @param {object} user
 * @returns {Promise}
 */
const generateOtpToken = async (user) => {
    const expires = moment().add(config.jwt.otpExpirationMinutes, 'minutes')
    const otp = generateOtp()
    await saveToken(otp, user._id, expires, tokenTypes.VERIFY_OTP)
    return otp
}

/**
 * Delete user's token
 * @param {import('mongoose').ObjectId} userId
 * @returns {Promise<Token>}
 */
const deleteToken = async (userId) => {
    return Token.findOneAndDelete({ user: userId })
}

/**
 * Get OTP Details from user id.
 * @param {import('mongoose').ObjectId} userId
 * @returns {Promise<Token>}
 */
const getUserOtp = async (userId) => {
    return Token.findOne({ user: userId }).select({
        token: 1,
        user: 1,
        type: 1,
        expires: 1,
    })
}

/**
 * Generate auth tokens
 * @param {User} user
 * @param {Object} req
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user, req) => {
    // Find user's role to get role name.
    const roleDetails = await Role.findOne({ _id: user.role })
    if (!roleDetails) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            translateResponseMessage(req, 'not_found', 'role')
        )
    }

    // Set access_token's expire time to expire the token after one year.
    const accessTokenExpires = moment().add(
        config.jwt.accessExpirationYear,
        'year'
    )
    // Generate a new access token from user's unique id and role's name for authenticate.
    const accessToken = generateToken(
        user._id,
        accessTokenExpires,
        tokenTypes.ACCESS,
        roleDetails &&
            (roleDetails.role_slug == ROLES.user ? ROLES.user : ROLES.admin)
    )

    // Set refresh_token's expire time to expire the token in some days.
    const refreshTokenExpires = moment().add(
        config.jwt.refreshExpirationDays,
        'days'
    )
    // Generate a new refresh token from user's unique id and role's name for get new access token.
    const refreshToken = generateToken(
        user._id,
        refreshTokenExpires,
        tokenTypes.REFRESH,
        roleDetails &&
            (roleDetails.role_slug == ROLES.user ? ROLES.user : ROLES.admin)
    )

    await saveToken(
        refreshToken,
        user._id,
        refreshTokenExpires,
        tokenTypes.REFRESH
    )

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate(),
        },
    }
}

module.exports = {
    generateOtpToken,
    generateOtp,
    deleteToken,
    getUserOtp,
    generateAuthTokens,
}
