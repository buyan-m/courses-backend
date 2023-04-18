import mongoose from 'mongoose'

export const TeacherSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }
})
