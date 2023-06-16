import mongoose from 'mongoose'
import { TeacherTypes } from '../constants/teacher-types'

export const TeacherSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    type: {
        type: String,
        enum: Object.keys(TeacherTypes)
    }
})
