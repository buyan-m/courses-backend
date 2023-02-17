import { Module } from '@nestjs/common'
import { RoleService } from './role.service'
import { DBModule } from '../DBProviders/db.module'

@Module({
    imports: [ DBModule ],
    providers: [ RoleService ],
    exports: [ RoleService ]
})
export class RoleModule {}
