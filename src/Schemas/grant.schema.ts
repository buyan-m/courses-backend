import * as mongoose from 'mongoose'

export const GrantSchema = new mongoose.Schema({
    objectType: String,
    userId: String,
    objectId: String
})
