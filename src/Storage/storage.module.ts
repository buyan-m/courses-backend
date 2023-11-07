import { Module } from '@nestjs/common'
import { StorageService } from './storage.service'
import { DBModule } from '../DBProviders/db.module'
import { AuthService } from '../Auth/auth.service'

@Module({
    imports: [ DBModule ],
    providers: [ StorageService, AuthService ],
    exports: [ StorageService ]
})
export class StorageModule {}
