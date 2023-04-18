import { AnswerSchema } from '../Schemas/answer.schema'
import { Connection } from 'mongoose'

export const answerProvider = {
    provide: 'ANSWER_MODEL',
    useFactory: (connection: Connection) => connection.model('Answer', AnswerSchema),
    inject: [ 'DATABASE_CONNECTION' ]
}
