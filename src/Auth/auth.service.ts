import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import {
    Auth, Role, Token, User
} from '../types/entities.types'
import * as bcrypt from 'bcrypt'
import { TOKEN_MAX_AGE } from '../constants/auth-token-age'
import { Roles } from '../constants/general-roles'
import { throwUnauthorized } from '../utils/errors'

const HASH_ROUNDS = 3

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

    async register(email: string, password: string, name: string) {
        // check email validity
        const auth = await this.authModel.findOne({ email })
        if (!auth) {
            const hash = await bcrypt.hash(password, HASH_ROUNDS)
            const user = await new this.userModel({ name }).save()
            const token = await bcrypt.hash(email, hash)
            await Promise.all([
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

            return token
        }

        throwUnauthorized()
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
