import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { Role } from '../types/entities.types'

@Injectable()
export class RoleService {
    constructor(
        @Inject('ROLE_MODEL')
        private roleModel: Model<Role>
    ) {}

    getUserRoles(userId){
        return this.roleModel.find({ userId })
    }
}
