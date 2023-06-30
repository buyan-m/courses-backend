import { NotificationSchema } from '../Schemas/notification.schema'

import { Connection } from 'mongoose'

export const notificationProvider = {
    provide: 'NOTIFICATION_MODEL',
    useFactory: (connection: Connection) => connection.model('Notification', NotificationSchema),
    inject: [ 'DATABASE_CONNECTION' ]
}
