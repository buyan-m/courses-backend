import { Module } from '@nestjs/common'
import { EditorModule } from './Editor/editor.module'
import { ViewerModule } from './Viewer/viewer.module'
import { AuthModule } from './Auth/auth.module'
import { CommonModule } from './Common/common.module'
import { AdminModule } from './Admin/admin.module'
import { RoleModule } from './Role/role.module'

@Module({ imports: [ EditorModule, ViewerModule, AuthModule, CommonModule, AdminModule, RoleModule ] })
export class AppModule {}
