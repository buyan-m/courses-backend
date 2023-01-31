import * as mongoose from 'mongoose'

export const CourseSchema = new mongoose.Schema({
    name: { type: String, index: true },
    description: { type: String, index: true }
})

CourseSchema.index({
    name: 'text',
    description: 'text'
})
