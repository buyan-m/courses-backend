import {
    Body, Controller, Put, Get, Delete, Param, Query
} from '@nestjs/common'
import { AdminService } from './admin.service'
import { AuthService } from '../Auth/auth.service'
import { EmailApproveDto, TAdminUserData } from '../types/admin.classes'
import { Token } from '../utils/extractToken'
import { throwForbidden, throwUnauthorized } from '../utils/errors'
import { OkResponse } from '../utils/emptyResponse'
import { DEV_MODE } from '../constants/dev-mode'
import { ObjectIdValidationPipe } from '../utils/object-id'
import { NotificationService } from '../Notification/notification.service'
import { StorageService } from '../Storage/storage.service'
import { Types } from 'mongoose'

@Controller('/admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly authService: AuthService,
        private readonly notificationService: NotificationService,
        private readonly storageService: StorageService,
    ) {}

    @Get('fresh-email/list')
    async getEmails(@Token() token: string) {
        const userId = await this.authService.getUserId(token)
        // todo: move grant check to role service
        if (!userId) {
            throwUnauthorized()
        }

        await this.adminService.checkGrants(userId)
        return this.adminService.getEmailList(userId)
    }

    @Put('fresh-email/approve')
    async approveEmail(@Body() body: EmailApproveDto, @Token() token: string) {
        const userId = await this.authService.getUserId(token)
        if (!userId) {
            throwUnauthorized()
        }

        await this.adminService.checkGrants(userId)

        await this.adminService.approveEmail(userId, body.email)
        return new OkResponse()
    }

    @Get('courses/list')
    async getCourses(@Token() token: string) {
        const userId = await this.authService.getUserId(token)
        if (!userId) {
            throwUnauthorized()
        }

        await this.adminService.checkGrants(userId)
        return this.adminService.getCoursesList()
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

    @Get('issues')
    async getIssues(@Token() token: string, @Query('offset') offset: string) {
        const userId = await this.authService.getUserId(token)
        if (!userId) {
            throwUnauthorized()
        }
        await this.adminService.checkGrants(userId)
        return this.adminService.getIssues({ offset: offset ? parseInt(offset) : undefined })
    }

    @Delete('s3-object/:key')
    async deleteS3Object(@Token() token: string, @Param('key') key: string) {
        const userId = await this.authService.getUserId(token)
        if (!userId) {
            throwUnauthorized()
        }
        await this.adminService.checkGrants(userId)
        return this.storageService.deleteObject(key)
    }

    @Delete('user-s3-objects/:userId')
    async deleteUserS3Objects(@Token() token: string, @Param('userId') userId: string) {
        const actorId = await this.authService.getUserId(token)
        if (!actorId) {
            throwUnauthorized()
        }
        await this.adminService.checkGrants(actorId)
        return this.storageService.deleteUserData(userId)
    }

    @Get('users/list')
    async getFreshUsers(@Token() token: string) {
        const userId = await this.authService.getUserId(token)
        // todo: move grant check to role service
        if (!userId) {
            throwUnauthorized()
        }
        await this.adminService.checkGrants(userId)
        return this.adminService.getUserList()
    }

    @Get('user/:userId')
    async getUser(@Token() token: string, @Param('userId') userId: string): Promise<TAdminUserData> {
        const actorId = await this.authService.getUserId(token)
        if (!actorId) {
            throwUnauthorized()
        }
        await this.adminService.checkGrants(actorId)
        const userInfoPromise = this.authService.getUserInfo(new Types.ObjectId(userId))
        const latestUploadsPromise = this.storageService.getUploads({ userId, offset: 0 })

        return Promise.all([ userInfoPromise, latestUploadsPromise ])
            .then(([ userInfo, latestUploads ]) => {
                return {
                    userInfo,
                    latestUploads
                }
            })
    }

    @Get('user/:userId/uploads/:offset')
    async getMoreUserUploads(@Token() token: string, @Param('userId') userId: string, @Param('offset') offset: string) {
        const actorId = await this.authService.getUserId(token)
        if (!actorId) {
            throwUnauthorized()
        }
        await this.adminService.checkGrants(actorId)

        return this.storageService.getUploads({ userId, offset: parseInt(offset) })
    }
}
