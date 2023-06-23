const express = require('express')
const { userController } = require('../../../controllers/userControllers')
const auth = require('../../../middlewares/auth')
const validate = require('../../../middlewares/validate')
const { ROLES } = require('../../../utils/constant.helper')
const { userValidation } = require('../../../validations')

const router = express.Router()

router
    .route('/')
    /** Create or manage user */
    .post(
        auth(ROLES.user),
        validate(userValidation.createUser),
        userController.createUser
    )
    /** Get all user list */
    .get(
        auth(ROLES.user),
        validate(userValidation.getUsers),
        userController.getUsers
    )

router
    .route('/:userId')
    /** Get user details by user details */
    .get(
        auth(ROLES.user),
        validate(userValidation.getUser),
        userController.getUser
    )
    /** Update user details */
    .put(
        auth(ROLES.user),
        validate(userValidation.updateUser),
        userController.updateUser
    )
    /** Delete User */
    .delete(
        auth(ROLES.user),
        validate(userValidation.getUser),
        userController.deleteUser
    )

/** Update user activity status */
router.put(
    '/update-status/:userId',
    auth(ROLES.user),
    validate(userValidation.getUser),
    userController.updateUserStatus
)

module.exports = router
