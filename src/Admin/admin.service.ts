import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import {
    TAuth, TCourseDTO, TCourseUpdateDTO, TRole, TUserId
} from '../types/entities.types'
import { Roles } from '../constants/general-roles'

@Injectable()
export class AdminService {
    constructor(
        @Inject('AUTH_MODEL')
        private authModel: Model<TAuth>,
        @Inject('ROLE_MODEL')
        private roleModel: Model<TRole>,
        @Inject('COURSE_MODEL')
        private courseModel: Model<TCourseDTO>,
    ) {}

    async checkGrants(userId) {
        const role = await this.roleModel.findOne({ userId, role: Roles.admin })
        if (!role) {
            throw new Error('Forbidden')
        }
    }

    async getEmailList(userId: TUserId): Promise<{ email: string, role: Roles }[] | string> {
        await this.checkGrants(userId)

        const roles = await this.roleModel.find({ role: Roles.guest })
        return Promise.all(roles.map((role) => this.authModel
            .findOne({ userId: role.userId })
            .select('email')
            .then((auth) => ({ email: auth.email, role: role.role }))))
    }

    async approveEmail(userId: TUserId, email: string) {
        await this.checkGrants(userId)

        const auth = await this.authModel.findOne({ email })
        if (!auth || !auth.userId) {
            throw new Error('Not found')
        }

        return this.roleModel.findOneAndUpdate({
            userId: auth.userId,
            role: Roles.guest
        }, {
            userId: auth.userId,
            role: Roles.user
        })
    }

    async getCoursesList(userId: TUserId):Promise<TCourseUpdateDTO[]> {
        await this.checkGrants(userId)

        return this.courseModel.find({})
    }
}
