import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import {
    TAuth, TRole, TUserId
} from '../types/entities.types'
import { roles } from '../constants/general-roles'

@Injectable()
export class AdminService {
    constructor(
        @Inject('AUTH_MODEL')
        private authModel: Model<TAuth>,
        @Inject('ROLE_MODEL')
        private roleModel: Model<TRole>,
    ) {}

    async getEmailList(userId: TUserId): Promise<TRole[] | string> {
        const role = await this.roleModel.findOne({ userId, role: roles.admin })
        if (!role) {
            throw new Error('Forbidden')
        }
        return this.roleModel.find({ role: roles.guest })
    }

    async approveEmail(userId: TUserId, email: string) {
        const role = await this.roleModel.findOne({ userId, role: roles.admin })
        if (!role) {
            throw new Error('Forbidden')
        }

        const { userId: guestUserId } = await this.authModel.findOne({ email })
        if (!guestUserId) {
            throw new Error('Not found')
        }

        return this.roleModel.findOneAndUpdate({
            userId: guestUserId,
            role: roles.guest
        }, {
            userId: guestUserId,
            role: roles.user
        })
    }
}
