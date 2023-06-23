const Joi = require('joi')
const { password, objectId } = require('./custom.validation')

/** Create user validation */
const createUser = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required().custom(password),
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
    }),
}

/** Get all users validation */
const getUsers = {
    query: Joi.object().keys({
        search: Joi.string().allow(''),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
}

/** get single user by id */
const getUser = {
    params: Joi.object().keys({
        userId: Joi.string().custom(objectId),
    }),
}

/** update user validation */
const updateUser = {
    params: Joi.object().keys({
        userId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            email: Joi.string().email(),
            password: Joi.string().custom(password),
            first_name: Joi.string(),
            last_name: Joi.string(),
        })
        .min(1),
}

module.exports = {
    createUser,
    getUsers,
    getUser,
    updateUser,
}
