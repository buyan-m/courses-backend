import * as mongoose from 'mongoose'
import { AnswerCorrectness, AnswerTypes } from '../types/entities.types'
import { AnswerStates } from '../constants/answer-states'

const TestAnswerValueSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: Object.keys(AnswerTypes)
    },
    value: mongoose.Schema.Types.Mixed,
    correctness: {
        type: String,
        enum: Object.keys(AnswerCorrectness)
    },
    feedback: String
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
    status: {
        type: String,
        enum: Object.keys(AnswerStates),
        default: 'active'
    },
    answers: [ TestAnswerSchema ]
})
