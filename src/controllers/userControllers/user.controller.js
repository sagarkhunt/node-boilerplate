const httpStatus = require('http-status')
const _ = require('lodash')
const { userService } = require('../../services')
const ApiError = require('../../utils/apiError')
const catchAsync = require('../../utils/catchAsync')
const { translateResponseMessage } = require('../../utils/functions')

/** Create new user */
const createUser = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body, req)

    res.status(httpStatus.CREATED).json({
        success: true,
        message: translateResponseMessage(req, 'created_successfully', 'user'),
        data: { user },
    })
})

/** Get all user list */
const getUsers = catchAsync(async (req, res) => {
    const options = _.pick(req.query, ['sortBy', 'limit', 'page', 'search'])
    options.searchFields = ['first_name', 'last_name']

    const result = await userService.queryUsers({ deletedAt: null }, options)

    res.status(httpStatus.OK).json({
        success: true,
        data: result,
    })
})

/** Get single user */
const getUser = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.userId)
    if (!user) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            translateResponseMessage(req, 'not_found', 'user')
        )
    }
    res.status(httpStatus.OK).json({
        success: true,
        data: user,
    })
})

/** Update user by id */
const updateUser = catchAsync(async (req, res) => {
    const userExists = await userService.getUserById(req.params.userId)
    if (!userExists) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            translateResponseMessage(req, 'not_found', 'user')
        )
    }

    const user = await userService.updateUserById(
        req.params.userId,
        req.body,
        req
    )
    res.status(httpStatus.OK).json({
        success: true,
        message: translateResponseMessage(req, 'updated_successfully', 'user'),
        data: user,
    })
})

/** Delete user by id */
const deleteUser = catchAsync(async (req, res) => {
    await userService.deleteUserById(req.params.userId, req)
    res.status(httpStatus.OK).json({
        success: true,
        message: translateResponseMessage(req, 'deleted_successfully', 'user'),
    })
})

/**
 * update user status is_active
 */
const updateUserStatus = catchAsync(async (req, res) => {
    const userExists = await userService.getUserById(req.params.userId)
    if (!userExists)
        throw new ApiError(
            httpStatus.NOT_FOUND,
            translateResponseMessage(req, 'not_found', 'user')
        )

    await userService.updateUserStatus(userExists)

    res.send({
        statusCode: httpStatus.OK,
        message: translateResponseMessage(
            req,
            'updated_successfully',
            'status'
        ),
    })
})

module.exports = {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    updateUserStatus,
}
