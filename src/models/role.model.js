const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const roleSchema = mongoose.Schema(
    {
        role_name: {
            type: String,
            trim: true,
        },
        role_slug: {
            type: String,
            trim: true,
        },
        is_active: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

roleSchema.plugin(toJSON);
roleSchema.plugin(paginate);

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;
