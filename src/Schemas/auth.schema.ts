import * as mongoose from 'mongoose'

export const AuthSchema = new mongoose.Schema({
    userId: String,
    email: String,
    password: String
})
