import { Module } from '@nestjs/common'
import { ShareCodeController } from './share-code.controller'
import { ShareCodeService } from './share-code.service'
import { DBModule } from '../DBProviders/db.module'
import { AuthService } from '../Auth/auth.service'

@Module({
    imports: [ DBModule ],
    controllers: [ ShareCodeController ],
    providers: [ ShareCodeService, AuthService ]
})
export class ShareCodeModule {}
