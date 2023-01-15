import { Connection } from 'mongoose'
import { LessonSchema } from '../Schemas/lesson.schema'

export const lessonProvider = {
    provide: 'LESSON_MODEL',
    useFactory: (connection: Connection) => connection.model('Lesson', LessonSchema),
    inject: [ 'DATABASE_CONNECTION' ]
}
