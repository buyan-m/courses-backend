import mongoose from 'mongoose'

export const PagePassNotificationSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    page: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Page'
    }
})
