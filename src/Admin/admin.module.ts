import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { DBModule } from '../DBProviders/db.module'
import { AuthService } from '../Auth/auth.service'
import { NotificationService } from '../Notification/notification.service'
import { NotificationModule } from '../Notification/notification.module'
import { StorageService } from '../Storage/storage.service'

@Module({
    imports: [ DBModule, NotificationModule ],
    controllers: [ AdminController ],
    providers: [ AdminService, AuthService, NotificationService, StorageService ]
})
export class AdminModule {}
