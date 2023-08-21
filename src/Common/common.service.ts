import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { Auth } from '../types/entities.types'
import { IssueReportDTO, IssueModelClass } from './common.classes'

@Injectable()
export class CommonService {

    constructor(
        @Inject('AUTH_MODEL')
        private authModel: Model<Auth>,
        @Inject('ISSUE_MODEL')
        private issueModel: Model<IssueModelClass>,
    ) {}

    async createIssue({
        email,
        actualEmail,
        report,
        url,
        userId
    }: IssueReportDTO) {
        const emailIsCorrect = await this.authModel.find({ userId, email: actualEmail }).count()
        return new this.issueModel({
            url,
            user: userId,
            writtenEmail: email,
            gotEmail: actualEmail,
            issueText: report,
            cdate: new Date,
            emailIsCorrect: !!emailIsCorrect
        }).save()
    }
}
