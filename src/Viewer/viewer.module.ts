import { Module } from '@nestjs/common'
import { ViewerController } from './viewer.controller'
import { ViewerService } from './viewer.service'
import { DBModule } from '../DBProviders/db.module'
import { AuthService } from '../Auth/auth.service'

@Module({
    imports: [ DBModule ],
    controllers: [ ViewerController ],
    providers: [ ViewerService, AuthService ]
})

export class ViewerModule {}
