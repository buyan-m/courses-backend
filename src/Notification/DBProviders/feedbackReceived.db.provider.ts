import { Connection } from 'mongoose'
import { FeedbackReceivedNotificationSchema } from '../Schemas/feedbackReceivedNotification.schema'

export const feedbackReceivedNotificationProvider = {
    provide: 'FEEDBACK_RECEIVED_NOTIFICATION_MODEL',
    useFactory: (connection: Connection) => connection.model(
        'FeedbackReceivedNotification',
        FeedbackReceivedNotificationSchema
    ),
    inject: [ 'DATABASE_CONNECTION' ]
}
