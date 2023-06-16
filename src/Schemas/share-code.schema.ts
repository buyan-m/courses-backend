import * as mongoose from 'mongoose'
import { ShareCodeStatus } from '../ShareCode/share-code.classes'

export const ShareCodeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    validTill: Number,
    status: {
        type: String,
        enum: Object.keys(ShareCodeStatus)
    }
})
