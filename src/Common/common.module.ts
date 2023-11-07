import { Module } from '@nestjs/common'
import { CommonController } from './common.controller'
import { CommonService } from './common.service'
import { AuthService } from '../Auth/auth.service'
import { DBModule } from '../DBProviders/db.module'
import { RoleService } from '../Role/role.service'
import { StorageService } from '../Storage/storage.service'

@Module({
    imports: [ DBModule ],
    controllers: [ CommonController ],
    providers: [ CommonService, AuthService, RoleService, StorageService ]
})
export class CommonModule {}
