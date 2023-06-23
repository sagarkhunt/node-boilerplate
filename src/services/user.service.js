const httpStatus = require('http-status')
const { Role, User } = require('../models')
const ApiError = require('../utils/apiError')
const { ROLES } = require('../utils/constant.helper')
const { translateResponseMessage } = require('../utils/functions')

/**
 * Create a user
 * @param {Object} userBody
 * @param {Object} req
 * @returns {Promise<User>}
 */
const createUser = async (userBody, req) => {
    if (await User.isEmailTaken(userBody.email)) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            translateResponseMessage(req, 'already_taken', 'email')
        )
    }

    const userRole = await Role.findOne({ role_slug: ROLES.user })
    if (!userRole) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            translateResponseMessage(req, 'not_found', 'role')
        )
    }

    return User.create({ ...userBody, role: userRole._id })
}

/**
 * Delete registered user details permanent.
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserPermanent = async (userId) => {
    return User.deleteOne({ _id: userId })
}

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
    return User.findOne({ email, deletedAt: null })
}

/**
 * User's email verification true
 * @param {import('mongoose').ObjectId} userId
 * @returns {Promise<User>}
 */
const userEmailVerify = async (userId) => {
    return User.findOneAndUpdate(
        { _id: userId },
        { $set: { is_verified: true } },
        { new: true }
    )
}

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 *  @param {Object} req
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody, req) => {
    if (
        updateBody.email &&
        (await User.isEmailTaken(updateBody.email, userId))
    ) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            translateResponseMessage(req, 'already_taken', 'email')
        )
    }

    return User.findOneAndUpdate(
        { _id: userId },
        { $set: updateBody },
        { new: true }
    )
}

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
    const users = await User.paginate(filter, options)
    return users
}

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
    return User.findOne({ _id: id, deletedAt: null })
}

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @param {ObjectId} req
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId, req) => {
    const user = await getUserById(userId)
    if (!user) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            translateResponseMessage(req, 'not_found', 'user')
        )
    }

    Object.assign(user, { deletedAt: new Date() })
    await user.save()

    return user
}

/**
 * change user status of user by userId
 * @param {Object} user
 * @returns {boolean}
 */
const updateUserStatus = async (user) => {
    Object.assign(user, { is_active: !user.is_active })
    await user.save()
    return true
}

module.exports = {
    createUser,
    deleteUserPermanent,
    getUserByEmail,
    userEmailVerify,
    updateUserById,
    queryUsers,
    getUserById,
    deleteUserById,
    updateUserStatus,
}
