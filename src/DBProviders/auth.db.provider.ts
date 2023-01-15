import { Connection } from 'mongoose'
import { AuthSchema } from '../Schemas/auth.schema'
import { TokenSchema } from '../Schemas/token.schema'

export const authProvider = {
    provide: 'AUTH_MODEL',
    useFactory: (connection: Connection) => connection.model('Auth', AuthSchema),
    inject: [ 'DATABASE_CONNECTION' ]
}

export const tokenProvider = {
    provide: 'TOKEN_MODEL',
    useFactory: (connection: Connection) => connection.model('Token', TokenSchema),
    inject: [ 'DATABASE_CONNECTION' ]
}
