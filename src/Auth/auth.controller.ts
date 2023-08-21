import {
    Controller, Post, Get, Res, Body, HttpStatus, Put
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { Response } from 'express'
import { TOKEN_MAX_AGE } from '../constants/auth-token-age'
import {
    AuthCheckResponse, AuthDto, ConfirmEmailDTO, RegisterDto, RequestConfirmEmailDTO, UserInfo
} from '../types/auth.classes'
import { RoleService } from '../Role/role.service'
import { Token } from '../utils/extractToken'
import { throwUnauthorized } from '../utils/errors'
import { ApiResponse } from '@nestjs/swagger'
import { MailerService } from 'src/Mailer/mailer.service'
import { OkResponse } from 'src/utils/emptyResponse'

@Controller()
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly roleService: RoleService,
        private readonly mailerService: MailerService,
    ) {}

    @Post('/auth')
    async auth(@Body() body: AuthDto, @Res() response: Response) {
        try {
            const token = await this.authService.auth(body.email.toLowerCase(), body.password)
            response.cookie('token', token, { httpOnly: true, maxAge: TOKEN_MAX_AGE * 1000 })
            response.send({})
        } catch (e) {
            if (!e) {
                throwUnauthorized()
            }
            response.statusCode = e.getStatus && e.getStatus() || HttpStatus.UNAUTHORIZED
            response.send({ errors: [ e.text ] })
        }
    }

    @Post('/register')
    async register(@Body() body: RegisterDto, @Res() response: Response) {
        try {
            const { token, confirmationCode } = await this.authService
                .register({
                    email: body.email.toLowerCase(), password: body.password, name: body.name
                })

            this.mailerService.sendEmailConfirmation({ to: body.email.toLowerCase(), code: confirmationCode })
            response.cookie('token', token, { httpOnly: true, maxAge: TOKEN_MAX_AGE })
            response.send({})
        } catch (e) {
            response.statusCode = (e.getStatus && e.getStatus()) || 501
            response.send({ errors: [ e.text ] })
        }
    }

    @Put('/email-confirm')
    async confirmEmail(@Body() { email, code }: ConfirmEmailDTO) {
        await this.authService.confirmEmail({ email, code })
        return new OkResponse()
    }

    @Post('/request-email-confirm')
    async requestEmailConfirmation(@Body() { email }: RequestConfirmEmailDTO) {
        const { code } = await this.authService.requestEmailConfirm({ email })
        this.mailerService.sendEmailConfirmation({ to: email, code })
        return new OkResponse()
    }

    @Get('/auth-check')
    @ApiResponse({ type: AuthCheckResponse })
    async checkAuth(@Token() token: string) {
        const userId = await this.authService.checkAuth(token)
        const roles = await this.roleService.getUserRoles(userId)
        return {
            userId,
            roles: roles.map(({ role }) => role)
        }
    }

    @Get('/me')
    @ApiResponse({ type: UserInfo })
    async getCurrentUserInfo(@Token() token: string) {
        const userId = await this.authService.checkAuth(token)
        return this.authService.getUserInfo(userId)
    }

    @Get('/logout')
    logout(@Token() token: string, @Res() response: Response) {
        this.authService.logout(token)
        response.cookie('token', '', { httpOnly: true, maxAge: 0 })
        response.send({})
    }
}
