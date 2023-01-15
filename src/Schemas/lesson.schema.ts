import mongoose from 'mongoose'

export const LessonSchema = new mongoose.Schema({
    name: String,
    courseId: String
})
