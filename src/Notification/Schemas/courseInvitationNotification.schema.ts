import mongoose from 'mongoose'

export const CourseInvitationNotificationSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    inviter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})
