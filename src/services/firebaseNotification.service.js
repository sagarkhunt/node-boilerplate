const { errorColor } = require('../utils/color.helper');
const firebaseAdmin = require('./firebaseAdmin.service');

/**
 * Send notification
 * @param {string} deviceToken
 * @param {string} title
 * @param {string} body
 * @param {string} type
 * @param {string | null} typeId
 */
const pushNotification = async (deviceToken, title, body, type, typeId = null) => {
    try {
        firebaseAdmin.messaging().sendToDevice(
            deviceToken,
            {
                notification: {
                    title: title,
                    body: body,
                },
                data: {
                    clickAction: 'NOTIFICATION_CLICK',
                    notification_type: type,
                    type_id: String(typeId), // Type id only allowed string value
                },
            },
            {
                priority: 'high',
                timeToLive: 60 * 60 * 24,
                contentAvailable: true,
            }
        );

    } catch (error) {
        console.log(errorColor, 'Notification Error: ', error);
    }
};

module.exports = {
    pushNotification,
};
