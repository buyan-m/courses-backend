import { Module } from '@nestjs/common'
import { EditorController } from './editor.controller'
import { EditorService } from './editor.service'
import { DBModule } from '../DBProviders/db.module'
import { AuthService } from '../Auth/auth.service'
import { RoleService } from '../Role/role.service'

@Module({
    imports: [ DBModule ],
    controllers: [ EditorController ],
    providers: [ EditorService, AuthService, RoleService ]
})
export class EditorModule {}
