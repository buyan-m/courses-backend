import mongoose from 'mongoose'

export const FeedbackReceivedNotificationSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    page: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Page'
    }
})
