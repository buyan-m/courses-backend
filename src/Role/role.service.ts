import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { Role, TUserId } from '../types/entities.types'

@Injectable()
export class RoleService {
    constructor(
        @Inject('ROLE_MODEL')
        private roleModel: Model<Role>
    ) {}

    getUserRoles(userId: TUserId){
        return this.roleModel.find({ userId })
    }
}
