import * as mongoose from 'mongoose'
import { roles } from '../constants/general-roles'

export const RoleSchema = new mongoose.Schema({
    userId: String,
    role: {
        type: String,
        enum: Object.keys(roles),
        default: 'guest'
    }
})
