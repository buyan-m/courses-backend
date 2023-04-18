import { Connection } from 'mongoose'
import { TeacherSchema } from '../Schemas/teacher.schema'

export const teacherProvider = {
    provide: 'TEACHER_MODEL',
    useFactory: (connection: Connection) => connection.model('Teacher', TeacherSchema),
    inject: [ 'DATABASE_CONNECTION' ]
}
