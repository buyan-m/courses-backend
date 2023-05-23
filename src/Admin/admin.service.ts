import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import {
    Auth, CourseUpdateDTO, Role, TUserId
} from '../types/entities.types'
import { CourseDTO } from '../types/editor.classes'
import { Roles } from '../constants/general-roles'
import { throwForbidden, throwNotFound } from '../utils/errors'

@Injectable()
export class AdminService {
    constructor(
        @Inject('AUTH_MODEL')
        private authModel: Model<Auth>,
        @Inject('ROLE_MODEL')
        private roleModel: Model<Role>,
        @Inject('COURSE_MODEL')
        private courseModel: Model<CourseDTO>,
    ) {}

    async checkGrants(userId) {
        const role = await this.roleModel.findOne({ userId, role: Roles.admin })
        if (!role) {
            throwForbidden()
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
            throwNotFound()
        }

        return this.roleModel.findOneAndUpdate({
            userId: auth.userId,
            role: Roles.guest
        }, {
            userId: auth.userId,
            role: Roles.user
        })
    }

    async getCoursesList(userId: TUserId):Promise<CourseUpdateDTO[]> {
        await this.checkGrants(userId)

        return this.courseModel.find({})
    }
}
