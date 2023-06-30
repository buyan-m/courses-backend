import { Module } from '@nestjs/common'
import { NotificationsDBModule } from './notification.db.module'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'
import { AuthService } from '../Auth/auth.service'
import { DBModule } from '../DBProviders/db.module'

@Module({
    imports: [ NotificationsDBModule, DBModule ],
    controllers: [ NotificationController ],
    providers: [ NotificationService, AuthService ],
    exports: [ NotificationService, NotificationsDBModule ]
})
export class NotificationModule {}
