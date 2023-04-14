import mongoose from 'mongoose'

export const LessonSchema = new mongoose.Schema({
    name: String,
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }
})
