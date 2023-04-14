import * as mongoose from 'mongoose'

export const TokenSchema = new mongoose.Schema({
    token: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    validTill: Date
})
