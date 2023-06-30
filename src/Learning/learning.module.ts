import { Module } from '@nestjs/common'
import { LearningController } from './learning.controller'
import { LearningService } from './learning.service'
import { DBModule } from '../DBProviders/db.module'
import { AuthService } from '../Auth/auth.service'
import { ShareCodeService } from '../ShareCode/share-code.service'
import { NotificationService } from '../Notification/notification.service'
import { NotificationModule } from '../Notification/notification.module'
import { ViewerService } from '../Viewer/viewer.service'

@Module({
    imports: [ DBModule, NotificationModule ],
    controllers: [ LearningController ],
    providers: [ LearningService, AuthService, ShareCodeService, NotificationService, ViewerService ]
})
export class LearningModule {}
