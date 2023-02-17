import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { DBModule } from '../DBProviders/db.module'
import { AuthService } from '../Auth/auth.service'

@Module({
    imports: [ DBModule ],
    controllers: [ AdminController ],
    providers: [ AdminService, AuthService ]
})
export class AdminModule {}
