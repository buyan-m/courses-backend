import * as mongoose from 'mongoose'

export const AuthSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    email: String,
    password: String
})
