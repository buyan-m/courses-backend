import { Connection } from 'mongoose'
import { GrantSchema } from '../Schemas/grant.schema'

export const grantProvider = {
    provide: 'GRANT_MODEL',
    useFactory: (connection: Connection) => connection.model('Grant', GrantSchema),
    inject: [ 'DATABASE_CONNECTION' ]
}
