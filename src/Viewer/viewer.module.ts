import { Module } from '@nestjs/common'
import { ViewerController } from './viewer.controller'
import { ViewerService } from './viewer.service'
import { DBModule } from '../DBProviders/db.module'

@Module({
    imports: [ DBModule ],
    controllers: [ ViewerController ],
    providers: [ ViewerService ]
})

export class ViewerModule {}
