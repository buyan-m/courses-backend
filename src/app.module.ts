import { Module } from '@nestjs/common'
import { ThrottlerModule } from '@nestjs/throttler'
import { EditorModule } from './Editor/editor.module'
import { ViewerModule } from './Viewer/viewer.module'
import { AuthModule } from './Auth/auth.module'
import { CommonModule } from './Common/common.module'
import { AdminModule } from './Admin/admin.module'
import { RoleModule } from './Role/role.module'
import { LearningModule } from './Learning/learning.module'
import { ShareCodeModule } from './ShareCode/share-code.module'
import { NotificationModule } from './Notification/notification.module'

@Module({
    imports: [
        EditorModule,
        ViewerModule,
        AuthModule,
        CommonModule,
        AdminModule,
        RoleModule,
        LearningModule,
        ShareCodeModule,
        NotificationModule,
        ThrottlerModule.forRoot({
            ttl: 60,
            limit: 10
        })
    ]
})
export class AppModule {}
