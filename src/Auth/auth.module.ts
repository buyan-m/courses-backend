import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { DBModule } from '../DBProviders/db.module'
import { RoleService } from '../Role/role.service'
import { MailerModule } from 'src/Mailer/mailer.module'

@Module({
    imports: [ DBModule, MailerModule ],
    controllers: [ AuthController ],
    providers: [ AuthService, RoleService ],
    exports: [ AuthService ]
})
export class AuthModule {}
