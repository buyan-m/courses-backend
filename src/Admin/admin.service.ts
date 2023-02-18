import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import {
    TAuth, TRole, TUserId
} from '../types/entities.types'
import { Roles } from '../constants/general-roles'

@Injectable()
export class AdminService {
    constructor(
        @Inject('AUTH_MODEL')
        private authModel: Model<TAuth>,
        @Inject('ROLE_MODEL')
        private roleModel: Model<TRole>,
    ) {}

    async getEmailList(userId: TUserId): Promise<unknown | string> {
        const role = await this.roleModel.findOne({ userId, role: Roles.admin })
        if (!role) {
            throw new Error('Forbidden')
        }
        const roles = await this.roleModel.find({ role: Roles.guest })
        return Promise.all(roles.map((role) => this.authModel
            .findOne({ userId: role.userId })
            .select('email')
            .then((auth) => ({ email: auth.email, role: role.role }))))
    }

    async approveEmail(userId: TUserId, email: string) {
        const role = await this.roleModel.findOne({ userId, role: Roles.admin })
        if (!role) {
            throw new Error('Forbidden')
        }

        const { userId: guestUserId } = await this.authModel.findOne({ email })
        if (!guestUserId) {
            throw new Error('Not found')
        }

        return this.roleModel.findOneAndUpdate({
            userId: guestUserId,
            role: Roles.guest
        }, {
            userId: guestUserId,
            role: Roles.user
        })
    }
}
