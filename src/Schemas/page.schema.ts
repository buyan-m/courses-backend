import mongoose from 'mongoose'

export const PageSchema = new mongoose.Schema({
    name: String,
    lessonId: String,
    structure: { blocks: Array },
    position: Number
})
