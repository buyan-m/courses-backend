import {
    Controller, Get, Param, Put, Query
} from '@nestjs/common'
import { Token } from '../utils/extractToken'
import { AuthService } from '../Auth/auth.service'
import { NotificationService } from './notification.service'
import { NotificationsResponse } from './notification.classes'
import { OkResponse } from '../utils/emptyResponse'
import { ApiResponse } from '@nestjs/swagger'

@Controller('notifications')
export class NotificationController {
    constructor(
        private readonly authService: AuthService,
        private readonly notificationsService: NotificationService,
    ) {
    }

    @Get('')
    @ApiResponse({ type: NotificationsResponse })
    async getNotifications(
        @Token() token: string,
            @Query('offset') offset: string,
            @Query('limit') limit: string
    ): Promise<NotificationsResponse> {
        const userId = await this.authService.getUserId(token)

        return this.notificationsService.getNotifications({
            userId,
            offset: parseInt(offset) || 0,
            limit: parseInt(limit) || 10
        })
    }

    @Put('read-all')
    async readAllNotifications(
        @Token() token: string
    ): Promise<OkResponse> {
        const userId = await this.authService.getUserId(token)
        await this.notificationsService.readAllNotifications(userId)
        return new OkResponse()
    }

    @Put('read/:notificationId')
    async readNotification(
    @Token() token: string,
        @Param('notificationId') notificationId: string
    ) {
        const userId = await this.authService.getUserId(token)
        await this.notificationsService.readNotification({ userId, notificationId })
        return new OkResponse()
    }
}
