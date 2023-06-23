const Role = require('../models/role.model')
const { successColor, errorColor } = require('../utils/color.helper')
const { ROLES } = require('../utils/constant.helper')

/************************************************************
    Seeding roles - seeding records if not in database
************************************************************/
const rolesData = [
    {
        role_name: 'Admin',
        role_slug: ROLES.admin,
        is_active: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        role_name: 'User',
        role_slug: ROLES.user,
        is_active: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
]

// Roles seeder
async function roleSeeder() {
    try {
        for (let roles of rolesData) {
            const alreadyExist = await Role.findOne({
                role_name: new RegExp(
                    roles.role_name.toLowerCase().trim() + '$',
                    'i'
                ),
            })
            if (!alreadyExist) {
                await Role.create(roles)
            }
        }

        console.log(successColor, 'Role seeded successfully!')
    } catch (error) {
        console.log(errorColor, 'Error from role seeder: ', error)
    }
}

module.exports = {
    roleSeeder,
}
