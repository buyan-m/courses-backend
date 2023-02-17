import { Connection } from 'mongoose'
import { RoleSchema } from '../Schemas/role.schema'

export const roleProvider = {
    provide: 'ROLE_MODEL',
    useFactory: (connection: Connection) => connection.model('Role', RoleSchema),
    inject: [ 'DATABASE_CONNECTION' ]
}
