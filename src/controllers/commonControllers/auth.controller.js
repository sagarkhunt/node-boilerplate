const httpStatus = require('http-status')
const {
    userService,
    tokenService,
    emailService,
    authService,
} = require('../../services')
const ApiError = require('../../utils/apiError')
const catchAsync = require('../../utils/catchAsync')
const ejs = require('ejs')
const path = require('path')
const { translateResponseMessage } = require('../../utils/functions')
const bcrypt = require('bcryptjs')

/**
 * send verify mail to user
 */
const sendVerifyEmail = async (mailData) => {
    // Send mail on requested email by users.
    await new Promise((resolve, reject) => {
        ejs.renderFile(
            path.join(__dirname, '../../../views/otpEmailTemplate.ejs'),
            {
                email: mailData.email,
                first_name: mailData.first_name,
                last_name: mailData.last_name,
                otp: mailData.otp,
                image_url: `${process.env.BASE_URL}default/default_user_image.jpg`, // Add your logo image path. Here, temporary add user default image path.
            },
            async (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            }
        )
    })
        .then(async (data) => {
            const mailSend = await emailService.sendOtpToEmail(
                mailData.email,
                mailData.subject,
                data
            )
            if (!mailSend) {
                throw new Error()
            }
            return true
        })
        .catch(async () => {
            return false
        })
    return true
}

/** Register */
const register = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body, req)
    const otp = await tokenService.generateOtpToken(user)

    // Send mail on requested email by users.
    const mailSent = await sendVerifyEmail({
        ...req.body,
        otp,
        subject: 'Register!',
    })
    if (!mailSent) {
        await userService.deleteUserPermanent(user._id)
        await tokenService.deleteToken(user._id)
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            translateResponseMessage(req, 'something_went_wrong', '')
        )
    }

    res.status(httpStatus.CREATED).json({
        success: true,
        message: translateResponseMessage(req, 'otp_sent', 'email'),
        data: { user },
    })
})

/** Verify OTP */
const verifyOtp = catchAsync(async (req, res) => {
    const { email, otp } = req.body

    const existsUser = await userService.getUserByEmail(email)
    if (!existsUser) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            translateResponseMessage(req, 'not_found', 'email')
        )
    }

    if (existsUser?.isActive == false) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            translateResponseMessage(req, 'account_blocked', '')
        )
    }

    let otpDetails = await tokenService.getUserOtp(existsUser._id)
    if (!otpDetails) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            translateResponseMessage(req, 'something_went_wrong', '')
        )
    }

    const otpExpireTime = otpDetails.expires
    const currentTime = new Date()

    /** Check otp is wrong or not. */
    if (otpDetails.token != otp) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            translateResponseMessage(req, 'invalid', 'otp')
        )
    }

    /** Check otp is expire in 10 minutes or not. */
    if (otpExpireTime <= currentTime) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            translateResponseMessage(req, 'expired', 'otp')
        )
    }

    // check user is verified or not.
    if (!existsUser?.is_verified) {
        await userService.userEmailVerify(existsUser._id)
    }

    // Generate access token for user authenticate.
    // const tokens = await tokenService.generateAuthTokens(existsUser, req)

    res.status(200).json({
        success: true,
        message: translateResponseMessage(req, 'verified_successfully', 'otp'),
        // data: { user: existsUser, tokens },
    })
})

/** Login */
const login = catchAsync(async (req, res) => {
    const { email, password } = req.body
    let resMessage = translateResponseMessage(req, 'success', 'login')
    let user, tokens

    const existsUser = await userService.getUserByEmail(email)
    if (!existsUser) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            translateResponseMessage(req, 'not_found', 'email')
        )
    }

    if (existsUser?.is_verified === false) {
        const otp = await tokenService.generateOtpToken(existsUser)

        // Send mail on requested email by users.
        const mailSent = await sendVerifyEmail({
            ...req.body,
            otp,
            subject: 'Login!',
        })
        if (!mailSent) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                translateResponseMessage(req, 'something_went_wrong', '')
            )
        }

        resMessage = translateResponseMessage(req, 'otp_sent', 'email')
    }

    if (existsUser?.is_verified === true) {
        user = await authService.loginUserWithEmailAndPassword(
            existsUser,
            password,
            req
        )
        tokens = await tokenService.generateAuthTokens(user, req)
    }
    console.log(user,'===')
    res.status(200).json({
        success: true,
        message: resMessage,
        data: { tokens, user },
    })
})

/** Logout */
const logout = catchAsync(async (req, res) => {
    await authService.logout(req.body.refreshToken, req)
    res.status(httpStatus.NO_CONTENT).json({
        success: true,
        message: translateResponseMessage(req, 'success', 'logout'),
    })
})

/** Send OTP */
const sendOtp = catchAsync(async (req, res) => {
    const existsUser = await userService.getUserByEmail(req.body.email)
    if (!existsUser) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            translateResponseMessage(req, 'not_found', 'email')
        )
    }

    const otp = await tokenService.generateOtpToken(existsUser)

    // Send mail on requested email by users.
    const mailSent = await sendVerifyEmail({
        ...req.body,
        otp,
        subject: 'Verify Mail!',
    })
    if (!mailSent) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            translateResponseMessage(req, 'something_went_wrong', '')
        )
    }

    res.status(httpStatus.OK).json({
        success: true,
        message: translateResponseMessage(req, 'otp_sent', 'email'),
    })
})

/** Reset Password */
const resetPassword = catchAsync(async (req, res) => {
    const { email, password } = req.body
    const existsUser = await userService.getUserByEmail(email)
    if (!existsUser) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            translateResponseMessage(req, 'not_found', 'email')
        )
    }

    if (existsUser?.isActive == false) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            translateResponseMessage(req, 'account_blocked', '')
        )
    }

    const hashPassword = await bcrypt.hash(password, 8)
    const resetPass = await authService.resetPassword(
        existsUser._id,
        hashPassword
    )

    if (!resetPass) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            translateResponseMessage(req, 'reset_successfully', '')
        )
    }

    res.status(httpStatus.OK).json({
        success: true,
        message: translateResponseMessage(
            req,
            'reset_successfully',
            'password'
        ),
    })
})

module.exports = {
    register,
    verifyOtp,
    login,
    logout,
    resetPassword,
    sendOtp,
}
