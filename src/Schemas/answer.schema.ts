import * as mongoose from 'mongoose'

const TestAnswerValueSchema = new mongoose.Schema({
    type: String,
    value: mongoose.Schema.Types.Mixed
})

const TestAnswerSchema = new mongoose.Schema({
    id: String,
    answer: TestAnswerValueSchema
})

export const AnswerSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    pageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Page'
    },
    answers: [ TestAnswerSchema ]
})
