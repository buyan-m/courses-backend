import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import {
    TAuth, TRole, TToken, TUser
} from '../types/entities.types'
import * as bcrypt from 'bcrypt'
import { TOKEN_MAX_AGE } from '../constants/auth-token-age'
import { Roles } from '../constants/general-roles'

const HASH_ROUNDS = 3

@Injectable()
export class AuthService {
    constructor(
        @Inject('AUTH_MODEL')
        private authModel: Model<TAuth>,
        @Inject('TOKEN_MODEL')
        private tokenModel: Model<TToken>,
        @Inject('USER_MODEL')
        private userModel: Model<TUser>,
        @Inject('ROLE_MODEL')
        private roleModel: Model<TRole>,
    ) {}

    async auth(email: string, password: string) {
        const auth = await this.authModel.findOne({ email })

        if (!auth) {
            throw new Error('Unauthorised')
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
                    reject(new Error('Unauthorised'))
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

        throw new Error('Unauthorised')
    }

    async checkAuth(token: string) {
        if (!token) {
            throw new Error('Unauthorised')
        }
        const session = await this.tokenModel.findOne({ token })

        if (!session) {
            throw new Error('Unauthorised')
        }
        if (session.validTill < new Date()) {
            session.deleteOne()
            throw new Error('Unauthorised')
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
