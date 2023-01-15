import { Module } from '@nestjs/common'
import { EditorController } from './editor.controller'
import { EditorService } from './editor.service'
import { DBModule } from '../DBProviders/db.module'

@Module({
    imports: [ DBModule ],
    controllers: [ EditorController ],
    providers: [ EditorService ]
})
export class EditorModule {}
