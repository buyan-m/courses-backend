import * as mongoose from 'mongoose'

export const GrantSchema = new mongoose.Schema({
    objectType: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    objectId: String
})
