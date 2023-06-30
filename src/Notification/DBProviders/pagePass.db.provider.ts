import { PagePassNotificationSchema } from '../Schemas/pagePassNotification.schema'

import { Connection } from 'mongoose'

export const pagePassNotificationProvider = {
    provide: 'PAGE_PASS_NOTIFICATION_MODEL',
    useFactory: (connection: Connection) => connection.model('PagePassNotification', PagePassNotificationSchema),
    inject: [ 'DATABASE_CONNECTION' ]
}
