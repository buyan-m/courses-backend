import mongoose from 'mongoose'

export const EmailConfirmationSchema = new mongoose.Schema({
    email: String,
    code: String,
    validTill: Date
})
