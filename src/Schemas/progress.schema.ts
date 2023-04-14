import mongoose from 'mongoose'

export const ProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    checked: Boolean,
    objectId: String,
    objectType: String
})
