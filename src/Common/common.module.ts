import { Module } from '@nestjs/common'
import { CommonController } from './common.controller'
import { CommonService } from './common.service'
import { AuthService } from '../Auth/auth.service'
import { DBModule } from '../DBProviders/db.module'

@Module({
    imports: [ DBModule ],
    controllers: [ CommonController ],
    providers: [ CommonService, AuthService ]
})
export class CommonModule {}
