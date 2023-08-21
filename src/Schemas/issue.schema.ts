import * as mongoose from 'mongoose'

export const IssueSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    writtenEmail: String,
    gotEmail: String,
    issueText: String,
    url: String,
    cdate: Date,
    checked: Boolean,
    emailIsCorrect: Boolean
})
