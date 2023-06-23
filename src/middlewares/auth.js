const passport = require('passport')
const httpStatus = require('http-status')
const Role = require('../models/role.model')
// const { Permission } = require('../models');
// const { validateAccessPermission } = require('../services/auth.service');
const { translateResponseMessage } = require('../utils/functions')
const ApiError = require('../utils/apiError')

const verifyCallback =
    (req, resolve, reject, requiredRights) => async (err, user, info) => {
        /** THIS COMMENTED CODE WILL USE IF WE WANT TO SET DYNAMIC PERMISSION FOR ROLE USING SLUG */
        // let requireRights = requiredRights;
        // /**
        //  * if route have optional, then check the auth token exists or valid
        //  * 1. no need to check the permissions if requiredRights have optional and no auth user
        //  * 2. remove optional from requiredRights if have optional and auth user have value and check the permissions
        //  * 3. if requiredRights have not optional and no auth user then gives an error for required authentication
        //  */
        // if (requiredRights.includes('optional')) {
        //     if (user) {
        //         requireRights = requiredRights.filter((e) => e !== 'optional');
        //     } else {
        //         return resolve();
        //     }
        // }

        // if (err || info || !user) {
        //     return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
        // }
        // if (user && !user.isActive) {
        //     return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Your account has been blocked.'));
        // }

        // req.user = user;

        // const permissionExists = await Permission.findOne({ slug: requireRights });
        // if (permissionExists) {
        //     /** check user have access permission */
        //     await validateAccessPermission(permissionExists._id, user.role);
        //     return resolve();
        // }

        // throw new ApiError(httpStatus.FORBIDDEN, 'You have not permission to access this route.');

        if (err || info || !user) {
            return reject(
                new ApiError(
                    httpStatus.UNAUTHORIZED,
                    translateResponseMessage(req, 'unauthorized', '')
                )
            )
        }

        const rolesData = await Role.findOne({ _id: user.role })
        if (!rolesData) {
            return reject(
                new ApiError(
                    httpStatus.NOT_FOUND,
                    translateResponseMessage(req, 'not_found', 'role')
                )
            )
        }

        /** Check user role is include in role require rights. */
        if (!requiredRights.includes(rolesData.role_slug)) {
            return reject(new ApiError(httpStatus.FORBIDDEN, `FORBIDDEN!`))
        }

        if (!user?.is_active) {
            return reject(
                new ApiError(
                    httpStatus.UNAUTHORIZED,
                    translateResponseMessage(req, 'blocked', '')
                )
            )
        }

        req.user = user
        resolve()
    }

const auth =
    (...requiredRights) =>
    async (req, res, next) => {
        return new Promise((resolve, reject) => {
            passport.authenticate(
                'jwt',
                { session: false },
                verifyCallback(req, resolve, reject, requiredRights)
            )(req, res, next)
        })
            .then(() => next())
            .catch((err) => next(err))
    }

module.exports = auth
