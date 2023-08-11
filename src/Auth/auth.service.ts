import { randomBytes } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import {
    Auth, Role, Token, User, EmailConfirmation
} from '../types/entities.types'
import * as bcrypt from 'bcrypt'
import { TOKEN_MAX_AGE } from '../constants/auth-token-age'
import { Roles } from '../constants/general-roles'
import { MAX_CONFIRM_EMAILS } from '../constants/max-confirm-emails'
import { throwForbidden, throwUnauthorized } from '../utils/errors'
import { EMAIL_CONFIRMATION_MAX_AGE } from '../constants/email-confirmation-age'
import { RegisterDto } from '../types/auth.classes'

const HASH_ROUNDS = 3

type TConfirmEmailParams = {
    email: string,
    code: string
}

function generateEmailConfirmationCode() {
    return randomBytes(8).toString('hex')
}

@Injectable()
export class AuthService {
    constructor(
        @Inject('AUTH_MODEL')
        private authModel: Model<Auth>,
        @Inject('TOKEN_MODEL')
        private tokenModel: Model<Token>,
        @Inject('USER_MODEL')
        private userModel: Model<User>,
        @Inject('ROLE_MODEL')
        private roleModel: Model<Role>,
        @Inject('EMAIL_CONFIRMATION_MODEL')
        private emailConfirmationModel: Model<EmailConfirmation>,
    ) {}

    async auth(email: string, password: string) {
        const auth = await this.authModel.findOne({ email })

        if (!auth) {
            throwUnauthorized()
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, auth.password, async (err, result) => {
                if (result) {
                    const token = await bcrypt.hash(email, auth.password)
                    await new this.tokenModel({
                        token,
                        userId: auth.userId,
                        validTill: new Date(Date.now() + (TOKEN_MAX_AGE * 1000))
                    }).save()
                    resolve(token)
                } else {
                    reject()
                }
            })})
    }

    async register({
        email, password, name
    }: RegisterDto) {
        // check email validity
        const auth = await this.authModel.findOne({ email })

        if (!auth) {
            const hash = await bcrypt.hash(password, HASH_ROUNDS)
            const user = await new this.userModel({ name }).save()
            const token = await bcrypt.hash(email, hash)
            const [ emailConfirmation ] = await Promise.all([
                new this.emailConfirmationModel({
                    email,
                    code: generateEmailConfirmationCode(),
                    validTill: new Date(Date.now() + (EMAIL_CONFIRMATION_MAX_AGE * 1000))
                }).save(),

                new this.authModel({
                    email,
                    password: hash,
                    userId: user._id
                }).save(),

                new this.tokenModel({
                    token,
                    userId: user._id,
                    validTill: new Date(Date.now() + (TOKEN_MAX_AGE * 1000))
                }).save(),

                new this.roleModel({
                    userId: user._id,
                    role: Roles.guest
                }).save()
            ])

            return { token, confirmationCode: emailConfirmation.code }
        }

        throwUnauthorized()
    }

    async confirmEmail({ email, code }: TConfirmEmailParams) {
        const auth = await this.authModel.findOne({ email })

        if (!auth) {
            throwUnauthorized()
        }

        const grant = await this.roleModel.findOne({ userId: auth.userId, role: Roles.user })

        if (grant) {
            return
        }

        const record = await this.emailConfirmationModel.findOne({ email, code })
        if (record && record.validTill > new Date()) {
            return this.roleModel.findOneAndUpdate({
                userId: auth.userId,
                role: Roles.guest
            }, {
                userId: auth.userId,
                role: Roles.user
            })
        }

        throwUnauthorized()
    }

    async requestEmailConfirm({ email }: {email: string}) {
        const auth = await this.authModel.findOne({ email })
        const grant = await this.roleModel.findOne({ userId: auth.userId, role: Roles.user })

        if (!auth) {
            throwUnauthorized()
        }

        if (grant) {
            throwForbidden()
        }

        const sent = await this.emailConfirmationModel.find({ email }).count()

        if (sent > MAX_CONFIRM_EMAILS) {
            throwForbidden()
        }

        const record = await new this.emailConfirmationModel({
            email,
            code: generateEmailConfirmationCode(),
            validTill: new Date(Date.now() + (EMAIL_CONFIRMATION_MAX_AGE * 1000))
        }).save()

        return {
            email: record.email,
            code: record.code
        }
    }

    async checkAuth(token: string) {
        if (!token) {
            throwUnauthorized()
        }
        const session = await this.tokenModel.findOne({ token })

        if (!session) {
            throwUnauthorized()
        }
        if (session.validTill < new Date()) {
            session.deleteOne()
            throwUnauthorized()
        }

        return session.userId
    }

    logout(token: string) {
        return this.tokenModel.findOneAndDelete({ token })
    }

    async getUserId(token: string) {
        const session = await this.tokenModel.findOne({ token })
        return session.userId
    }
}
