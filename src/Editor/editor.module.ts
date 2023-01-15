import { Module } from '@nestjs/common'
import { EditorController } from './editor.controller'
import { EditorService } from './editor.service'
import { DBModule } from '../DBProviders/db.module'
import { AuthService } from '../Auth/auth.service'

@Module({
    imports: [ DBModule ],
    controllers: [ EditorController ],
    providers: [ EditorService, AuthService ]
})
export class EditorModule {}
