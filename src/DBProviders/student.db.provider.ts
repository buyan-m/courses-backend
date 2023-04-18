import { Connection } from 'mongoose'
import { StudentSchema } from '../Schemas/student.schema'

export const studentProvider = {
    provide: 'STUDENT_MODEL',
    useFactory: (connection: Connection) => connection.model('Student', StudentSchema),
    inject: [ 'DATABASE_CONNECTION' ]
}
