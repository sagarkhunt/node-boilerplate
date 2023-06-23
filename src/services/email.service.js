const config = require('../config/config')
const logger = require('../config/logger')
const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport(config.email.smtp)
/* istanbul ignore next */

transport
    .verify()
    .then(() => logger.info('📧 Connected to email server 📧'))
    .catch(() =>
        logger.warn(
            'Unable to connect to email server. Make sure you have configured the SMTP options in .env'
        )
    )

const sendOtpToEmail = async (to, subject, data) => {
    return await transport
        .sendMail({
            from: config.email.from,
            to: to,
            subject: subject,
            html: data,
        })
        .then((data) => true)
        .catch((err) => false)
}

module.exports = {
    sendOtpToEmail,
}
