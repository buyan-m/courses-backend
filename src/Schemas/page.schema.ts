import mongoose from 'mongoose'

export const PageSchema = new mongoose.Schema({
    name: String,
    lesson: String,
    structure: { blocks: Array }
})
