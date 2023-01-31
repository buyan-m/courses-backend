import { Connection } from 'mongoose'
import { ProgressSchema } from '../Schemas/progress.schema'

export const progressProvider = {
    provide: 'PROGRESS_MODEL',
    useFactory: (connection: Connection) => connection.model('Progress', ProgressSchema),
    inject: [ 'DATABASE_CONNECTION' ]
}
