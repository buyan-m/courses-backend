import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { DBModule } from '../DBProviders/db.module'

@Module({
    imports: [ DBModule ],
    controllers: [ AuthController ],
    providers: [ AuthService ],
    exports: [ AuthService ]
})
export class AuthModule {}
