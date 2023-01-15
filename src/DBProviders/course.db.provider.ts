import { Connection } from 'mongoose'
import { CourseSchema } from '../Schemas/course.schema'

export const coursesProvider = {
    provide: 'COURSE_MODEL',
    useFactory: (connection: Connection) => connection.model('Course', CourseSchema),
    inject: [ 'DATABASE_CONNECTION' ]
}
