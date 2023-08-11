import { Module } from '@nestjs/common'
import { MailerService } from './mailer.service'
import { DBModule } from '../DBProviders/db.module'

@Module({
    imports: [ DBModule ],
    providers: [ MailerService ],
    exports: [ MailerService ]
})
export class MailerModule {}
