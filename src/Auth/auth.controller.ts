import {
    Controller, Post, Get, Req, Res, Body
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { Request, Response } from 'express'
import { TOKEN_MAX_AGE } from '../constants/auth-token-age'
import { AuthDto, RegisterDto } from '../types/auth.classes'
import { RoleService } from '../Role/role.service'

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
            response.statusCode = 401
            response.send({ message: [ e.toString() ] })
        }
    }

    @Post('/register')
    async register(@Body() body: RegisterDto, @Res() response: Response) {
        try {
            const token = await this.authService.register(body.email.toLowerCase(), body.password, body.name)
            response.cookie('token', token, { httpOnly: true, maxAge: TOKEN_MAX_AGE })
            response.send({})
        } catch (e) {
            response.statusCode = 401
            response.send({ message: [ e.toString() ] })
        }
    }

    @Get('/auth-check')
    async checkAuth(@Req() request: Request, @Res() response: Response) {
        try {
            const userId = await this.authService.checkAuth(request.cookies.token)
            const roles = await this.roleService.getUserRoles(userId)
            response.send({
                userId,
                roles: roles.map(({ role }) => role)
            })
        } catch (e) {
            response.statusCode = 401
            response.send({ message: [ e.toString() ] })
        }
    }

    @Get('/logout')
    logout(@Req() request: Request, @Res() response: Response) {
        this.authService.logout(request.cookies.token)
        response.cookie('token', '', { httpOnly: true, maxAge: 0 })
        response.send({})
    }
}
