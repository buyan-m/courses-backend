import mongoose from 'mongoose'
import { NotificationStates, NotificationTypes } from '../notification.classes'

export const NotificationSchema = new mongoose.Schema({
    details: { type: mongoose.Schema.Types.ObjectId },

    cdate: Date,

    status: {
        type: String,
        enum: Object.keys(NotificationStates)
    },

    type: {
        type: String,
        enum: Object.keys(NotificationTypes)
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})
