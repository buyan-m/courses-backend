import {
    Body, Controller, Put, Get
} from '@nestjs/common'
import { AdminService } from './admin.service'
import { AuthService } from '../Auth/auth.service'
import { EmailApproveDto } from '../types/admin.classes'
import { Token } from '../utils/extractToken'
import { throwUnauthorized } from '../utils/errors'

@Controller('/admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly authService: AuthService,
    ) {}

    @Get('fresh-email/list')
    async getEmails(@Token() token: string) {
        const userId = await this.authService.getUserId(token)
        // todo: move grant check to role service
        if (!userId) {
            throwUnauthorized()
        }
        return this.adminService.getEmailList(userId)
    }

    @Put('fresh-email/approve')
    async approveEmail(@Body() body: EmailApproveDto, @Token() token: string) {
        const userId = await this.authService.getUserId(token)
        if (!userId) {
            throwUnauthorized()
        }

        await this.adminService.approveEmail(userId, body.email)
        return {}
    }

    @Get('courses/list')
    async getCourses(@Token() token: string) {
        const userId = await this.authService.getUserId(token)
        if (!userId) {
            throwUnauthorized()
        }

        return this.adminService.getCoursesList(userId)
    }
}
