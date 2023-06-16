import { Module } from '@nestjs/common'
import { LearningController } from './learning.controller'
import { LearningService } from './learning.service'
import { DBModule } from '../DBProviders/db.module'
import { AuthService } from '../Auth/auth.service'
import { ShareCodeService } from '../ShareCode/share-code.service'

@Module({
    imports: [ DBModule ],
    controllers: [ LearningController ],
    providers: [ LearningService, AuthService, ShareCodeService ]
})
export class LearningModule {}
