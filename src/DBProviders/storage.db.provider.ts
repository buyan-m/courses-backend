import { Connection } from 'mongoose'
import { StorageSchema } from '../Schemas/storage.schema'

export const storageProvider = {
    provide: 'STORAGE_MODEL',
    useFactory: (connection: Connection) => connection.model('Storage', StorageSchema),
    inject: [ 'DATABASE_CONNECTION' ]
}
