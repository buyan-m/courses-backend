import {
    Body, Controller, Put, Get, Res
} from '@nestjs/common'
import { AdminService } from './admin.service'
import { AuthService } from '../Auth/auth.service'
import { EmailApproveDto } from '../types/admin.classes'
import { Response } from 'express'
import { Token } from '../utils/extractToken'

@Controller('/admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly authService: AuthService,
    ) {}

    @Get('fresh-email/list')
    async getEmails(@Token() token: string, @Res() response: Response) {
        const userId = await this.authService.getUserId(token)
        // todo: move grant check to role service
        if (!userId) {
            response.statusCode = 401
            response.send({ message: [ 'Unauthorised' ] })
            return
        }
        try {
            response.statusCode = 200
            response.send(await this.adminService.getEmailList(userId))
        } catch (error) {
            response.statusCode = 403
            response.send({ message: [ error.toString() ] })
            return
        }
    }

    @Put('fresh-email/approve')
    async approveEmail(@Body() body: EmailApproveDto, @Token() token: string, @Res() response: Response) {
        const userId = await this.authService.getUserId(token)
        // todo: move grant check to role service
        if (!userId) {
            response.statusCode = 401
            response.send({ message: [ 'Unauthorised' ] })
            return
        }
        try {
            await this.adminService.approveEmail(userId, body.email)
            response.statusCode = 200
            response.send({})
        } catch (error) {
            const errorText = error.toString()
            if (errorText === 'Error: Forbidden') {
                response.statusCode = 403
            } else if (errorText === 'Error: Not found') {
                response.statusCode = 404
            }

            response.send({ message: [ errorText ] })
            return
        }
    }
}
