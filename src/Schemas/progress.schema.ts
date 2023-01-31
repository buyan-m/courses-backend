import mongoose from 'mongoose'

export const ProgressSchema = new mongoose.Schema({
    userId: String,
    checked: Boolean,
    objectId: String,
    objectType: String
})
