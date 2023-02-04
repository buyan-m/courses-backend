import { Module } from '@nestjs/common'
import { EditorModule } from './Editor/editor.module'
import { ViewerModule } from './Viewer/viewer.module'
import { AuthModule } from './Auth/auth.module'
import { CommonModule } from './Common/common.module'

@Module({ imports: [ EditorModule, ViewerModule, AuthModule, CommonModule ] })
export class AppModule {}
