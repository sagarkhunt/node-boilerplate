const { ROLES } = require('../utils/constant.helper')
const { User, Role } = require('../models')
const { errorColor, successColor } = require('../utils/color.helper')

/************************************************************
    Seeding admins - seeding records if not in database
    Admin records seeding in users collection.
************************************************************/
const adminData = [
    {
        first_name: 'Admin',
        last_name: 'user',
        email: 'admin@gmail.com',
        password: 'Admin@123',
        user_image: null,
        is_active: true,
        is_verified: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
]

async function findRole() {
    const roleType = await Role.findOne({ role_slug: ROLES.admin })
    return roleType?._id
}

async function adminSeeder() {
    const roleId = await findRole()

    try {
        for (let admin of adminData) {
            const alreadyExist = await User.findOne({ role: roleId })

            if (!alreadyExist) {
                await User.create({
                    first_name: admin.first_name,
                    last_name: admin.last_name,
                    email: admin.email,
                    role: roleId,
                    password: admin.password,
                    user_image: admin.user_image,
                    is_active: admin.is_active,
                    is_verified: admin.is_verified,
                    deletedAt: admin.deletedAt,
                    createdAt: admin.createdAt,
                    updatedAt: admin.updatedAt,
                })
            }
        }

        console.log(successColor, 'Admin seeded successfully!')
    } catch (error) {
        console.log(errorColor, 'Error from admin seeder: ', error)
    }
}

module.exports = { adminSeeder }
