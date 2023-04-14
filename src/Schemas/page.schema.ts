import mongoose from 'mongoose'

export const PageSchema = new mongoose.Schema({
    name: String,
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    },
    isAnswersVisible: Boolean,
    structure: { blocks: Array },
    position: Number
})
