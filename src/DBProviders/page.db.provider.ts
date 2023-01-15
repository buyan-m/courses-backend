import { Connection } from 'mongoose'
import { PageSchema } from '../Schemas/page.schema'

export const pagesProvider = {
    provide: 'PAGE_MODEL',
    useFactory: (connection: Connection) => connection.model('Page', PageSchema),
    inject: [ 'DATABASE_CONNECTION' ]
}
