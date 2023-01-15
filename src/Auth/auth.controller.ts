import {
    Controller, Post, Get, Req, Res, Body
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { Request, Response } from 'express'
import { TOKEN_MAX_AGE } from '../constants/auth-token-age'

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/auth')
    async auth(@Body() body, @Res() response: Response) {
        try {
            const token = await this.authService.auth(body.email.toLowerCase(), body.password)
            response.cookie('token', token, { httpOnly: true, maxAge: TOKEN_MAX_AGE })
            response.send({})
        } catch (e) {
            response.statusCode = 401
            response.send(e)
        }
    }

    @Post('/register')
    async register(@Body() body, @Res() response: Response) {
        try {
            const token = await this.authService.register(body.email.toLowerCase(), body.password, body.name)
            response.cookie('token', token, { httpOnly: true, maxAge: TOKEN_MAX_AGE })
            response.send({})
        } catch (e) {
            response.statusCode = 401
            response.send(e)
        }
    }

    @Get('/auth-check')
    checkAuth(@Req() request: Request, @Res() response: Response) {
        return this.authService.checkAuth(request.cookies.token).then(() => {
            response.send({})
        }, (e) => {
            response.statusCode = 401
            response.send(e)
        })
    }

    @Get('/logout')
    logout(@Req() request: Request, @Res() response: Response) {
        this.authService.logout(request.cookies.token)
        response.cookie('token', '', { httpOnly: true, maxAge: 0 })
        response.send({})
    }
}
