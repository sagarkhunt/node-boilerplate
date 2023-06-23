const { default: mongoose } = require('mongoose')
const config = require('../config/config')
const logger = require('../config/logger')
const { errorColor } = require('../utils/color.helper')
// const {
//     insertPermissionsSeeder,
//     insertAccessPermissionsSeeder,
// } = require('./accessPermission.seeder')
const { adminSeeder } = require('./admin.seeder')
const { roleSeeder } = require('./role.seeder')

async function seeder() {
    try {
        mongoose
            .connect(config.mongoose.url, config.mongoose.options)
            .then(() => {
                logger.info('Connected to MongoDB')
            })

        await roleSeeder()
        await adminSeeder()

        /** THIS COMMENTED CODE WILL USE IF WE WANT TO SET DYNAMIC PERMISSION FOR ROLE USING SLUG */
        // await insertPermissionsSeeder();
        // await insertAccessPermissionsSeeder();

        /**
         * To exit with a 'failure' code use: process.exit(1)
         * To exit with a 'success' code use: process.exit(0)
         * Here we have used code 1 because it's process is used only one time when you change in seeder's files.
         */
        process.exit(0)
    } catch (error) {
        console.log(errorColor, 'Seeder error: ', error)
        process.exit(1)
    }
}

// Seeder calling..
seeder()
