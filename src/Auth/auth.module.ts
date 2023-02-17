import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { DBModule } from '../DBProviders/db.module'
import { RoleService } from '../Role/role.service'

@Module({
    imports: [ DBModule ],
    controllers: [ AuthController ],
    providers: [ AuthService, RoleService ],
    exports: [ AuthService ]
})
export class AuthModule {}
