import {
    Body, Controller, Put, Get, Delete, Param
} from '@nestjs/common'
import { AdminService } from './admin.service'
import { AuthService } from '../Auth/auth.service'
import { EmailApproveDto } from '../types/admin.classes'
import { Token } from '../utils/extractToken'
import { throwForbidden, throwUnauthorized } from '../utils/errors'
import { OkResponse } from '../utils/emptyResponse'
import { DEV_MODE } from '../constants/dev-mode'
import { ObjectIdValidationPipe } from '../utils/object-id'
import { NotificationService } from '../Notification/notification.service'

@Controller('/admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly authService: AuthService,
        private readonly notificationService: NotificationService,
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
        return new OkResponse()
    }

    @Get('courses/list')
    async getCourses(@Token() token: string) {
        const userId = await this.authService.getUserId(token)
        if (!userId) {
            throwUnauthorized()
        }

        return this.adminService.getCoursesList(userId)
    }

    @Delete('notifications/:userId')
    async deleteNotificationsForUser(@Token() token: string, @Param('userId', ObjectIdValidationPipe) userId: string) {
        if (!DEV_MODE) {
            throwForbidden()
        }

        const adminUserId = await this.authService.getUserId(token)
        if (!adminUserId) {
            throwUnauthorized()
        }

        await this.adminService.checkGrants(adminUserId)
        await this.notificationService.deleteNotificationsForUser(userId)
        return new OkResponse()
    }
}
