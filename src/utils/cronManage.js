const cron = require('node-cron')

cron.schedule('0 0 * * *', async () => {
    try {
        /** Write your logic here for cron which execute everyday at 12:00 AM. 👇 */
    } catch (error) {
        console.log('Cron job error: ', error)
    }
})
