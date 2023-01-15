import * as mongoose from 'mongoose'

export const TokenSchema = new mongoose.Schema({
    token: String,
    userId: String,
    validTill: Date
})
