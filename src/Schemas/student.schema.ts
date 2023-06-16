import mongoose from 'mongoose'
import { StudentTypes } from '../constants/student-types'

export const StudentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    type: {
        type: String,
        enum: Object.keys(StudentTypes)
    }
})
