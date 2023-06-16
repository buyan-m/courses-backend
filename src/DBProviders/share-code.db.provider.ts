import { Connection } from 'mongoose'
import { ShareCodeSchema } from '../Schemas/share-code.schema'

export const shareCodeProvider = {
    provide: 'SHARE_CODE_MODEL',
    useFactory: (connection: Connection) => connection.model('ShareCode', ShareCodeSchema),
    inject: [ 'DATABASE_CONNECTION' ]
}
