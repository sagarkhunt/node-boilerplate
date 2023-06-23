const { Permission, AccessPermission, Role } = require('../models')
const { successColor, errorColor } = require('../utils/color.helper')
const { ROLES } = require('../utils/constant.helper')

/************************************************************
    Seeding roles - seeding records if not in database
************************************************************/
const permissions = [
    {
        module: 'user',
        permission: 'list',
    },
    {
        module: 'user',
        permission: 'view',
    },
    {
        module: 'user',
        permission: 'create',
    },
    {
        module: 'user',
        permission: 'edit',
    },
    {
        module: 'user',
        permission: 'delete',
    },
]

/**
 * create all new permissions
 */
async function insertPermissionsSeeder() {
    try {
        // find new permissions
        const newPermissions = []
        for (const item of permissions) {
            const existsPermission = await Permission.findOne({
                module: item.module,
                permission: item.permission,
            })

            if (!existsPermission) {
                newPermissions.push({
                    slug: `${item.module}_${item.permission}`,
                    module: item.module,
                    permission: item.permission,
                })
            }
        }
        await Permission.create(newPermissions)

        console.log(successColor, 'Permission seeded successfully!')
    } catch (error) {
        console.log(errorColor, 'Error from permission seeder: ', error)
    }
}

async function insertAccessPermissionsSeeder() {
    try {
        // find admin role
        const adminRole = await Role.findOne({ role_slug: ROLES.admin })

        // get all permissions
        const allPermission = await Permission.find()
        const accessPermissions = Array.from(allPermission, (p) => ({
            role: adminRole._id,
            permission: p._id,
        }))

        const newAccessPermission = []

        for (const ap of accessPermissions) {
            const apFound = await AccessPermission.findOne({
                role: ap.role,
                permission: ap.permission,
            })
            if (!apFound)
                newAccessPermission.push({
                    role: ap.role,
                    permission: ap.permission,
                })
        }
        await AccessPermission.create(newAccessPermission)

        console.log(successColor, 'Access permission seeded successfully!')
    } catch (error) {
        console.log(errorColor, 'Error from access permission seeder: ', error)
    }
}

module.exports = {
    insertPermissionsSeeder,
    insertAccessPermissionsSeeder,
}
