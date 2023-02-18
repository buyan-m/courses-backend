import * as mongoose from 'mongoose'
import { Roles } from '../constants/general-roles'

export const RoleSchema = new mongoose.Schema({
    userId: String,
    role: {
        type: String,
        enum: Object.keys(Roles),
        default: 'guest'
    }
})
