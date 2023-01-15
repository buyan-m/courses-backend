import { Module } from '@nestjs/common'
import { EditorModule } from './Editor/editor.module'
import { ViewerModule } from './Viewer/viewer.module'
import { AuthModule } from './Auth/auth.module'

@Module({ imports: [ EditorModule, ViewerModule, AuthModule ] })
export class AppModule {}
