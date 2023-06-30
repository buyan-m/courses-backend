import { CourseInvitationNotificationSchema } from '../Schemas/courseInvitationNotification.schema'

import { Connection } from 'mongoose'

export const courseInvitationNotificationProvider = {
    provide: 'COURSE_INVITATION_NOTIFICATION_MODEL',
    useFactory: (connection: Connection) => connection.model(
        'CourseInvitationNotification',
        CourseInvitationNotificationSchema
    ),
    inject: [ 'DATABASE_CONNECTION' ]
}
