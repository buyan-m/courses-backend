import {
    Controller, Post, Get, Res, Body
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { Response } from 'express'
import { TOKEN_MAX_AGE } from '../constants/auth-token-age'
import {
    AuthCheckResponse, AuthDto, RegisterDto
} from '../types/auth.classes'
import { RoleService } from '../Role/role.service'
import { Token } from '../utils/extractToken'
import { throwUnauthorized } from '../utils/errors'
import { ApiResponse } from '@nestjs/swagger'

@Controller()
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly roleService: RoleService
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
            response.statusCode = e.getStatus()
            response.send(e.text)
        }
    }

    @Post('/register')
    async register(@Body() body: RegisterDto, @Res() response: Response) {
        try {
            const token = await this.authService.register(body.email.toLowerCase(), body.password, body.name)
            response.cookie('token', token, { httpOnly: true, maxAge: TOKEN_MAX_AGE })
            response.send({})
        } catch (e) {
            response.statusCode = e.getStatus()
            response.send(e.text)
        }
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

    @Get('/logout')
    logout(@Token() token: string, @Res() response: Response) {
        this.authService.logout(token)
        response.cookie('token', '', { httpOnly: true, maxAge: 0 })
        response.send({})
    }
}
