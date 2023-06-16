import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import {
    Student, Teacher, TUserId
} from '../types/entities.types'
import {
    ShareCode, ShareCodeDTO, ShareCodeStatus
} from './share-code.classes'
import { SHARE_CODE_MAX_AGE } from '../constants/share-code'
import { throwNotFound, throwUnprocessable } from '../utils/errors'

@Injectable()
export class ShareCodeService {
    constructor(
        @Inject('STUDENT_MODEL')
        private studentModel: Model<Student>,
        @Inject('TEACHER_MODEL')
        private teacherModel: Model<Teacher>,
        @Inject('SHARE_CODE_MODEL')
        private shareCodeModel: Model<ShareCode>
    ) {
    }

    async getOwnCode(userId: TUserId): Promise<ShareCodeDTO> {
        const code = await this.shareCodeModel.findOne({
            userId,
            status: ShareCodeStatus.actual
        })
        if (!code) {
            return this.getNewCode(userId)
        }
        if (code.validTill < Date.now()) {
            code.status = ShareCodeStatus.outdated
            code.save()
            return this.getNewCode(userId)
        }
        return {
            userId,
            _id: code._id
        }
    }

    async getNewCode(userId: TUserId): Promise<ShareCodeDTO> {
        const code = await new this.shareCodeModel({
            userId,
            validTill: Date.now() + SHARE_CODE_MAX_AGE,
            status: ShareCodeStatus.actual
        }).save()

        return {
            userId,
            _id: code._id
        }
    }

    async checkCode(code: string): Promise<ShareCode> {
        const shareCode = await this.shareCodeModel.findById(code)
        if (!shareCode) {
            throwNotFound()
        }
        if (shareCode.validTill < Date.now()) {
            shareCode.status = ShareCodeStatus.outdated
            await shareCode.save()
        }
        if (shareCode.status === ShareCodeStatus.outdated) {
            throwUnprocessable('Share code is outdated')
        }
        return shareCode
    }
}
