import { Module } from '@nestjs/common'
import { notificationProvider } from './DBProviders/notification.db.provider'
import { courseInvitationNotificationProvider } from './DBProviders/courseInvitation.db.provider'
import { DBModule } from '../DBProviders/db.module'
import { databaseProvider } from '../DBProviders/connection.db.provider'
import { pagePassNotificationProvider } from './DBProviders/pagePass.db.provider'
import { feedbackReceivedNotificationProvider } from './DBProviders/feedbackReceived.db.provider'

@Module({
    imports: [ DBModule ],
    exports: [
        databaseProvider,
        notificationProvider,
        courseInvitationNotificationProvider,
        pagePassNotificationProvider,
        feedbackReceivedNotificationProvider
    ],
    providers: [
        databaseProvider,
        notificationProvider,
        courseInvitationNotificationProvider,
        pagePassNotificationProvider,
        feedbackReceivedNotificationProvider
    ]
})
export class NotificationsDBModule {}
