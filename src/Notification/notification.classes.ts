import {
    LessonUpdateDTO, Page,
    TUserId, User, ViewerCourseResponse, PaginationInfo
} from '../types/entities.types'
import { Types } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'

type TSimplifiedCourse = Pick<ViewerCourseResponse, 'name'|'_id' >

export enum NotificationStates {
    new = 'new',
    viewed = 'viewed'
}

export enum NotificationTypes {
    courseInvitation = 'courseInvitation',
    pagePass = 'pagePass',
    feedbackReceived = 'feedbackReceived'
}

export type TNotificationId = Types.ObjectId

export class AbstractProductNotification {
    _id: TNotificationId

    status: NotificationStates

    user: User

    cdate: Date
}

export class CourseInvitationNotification extends AbstractProductNotification {
    type: NotificationTypes.courseInvitation

    details: {
        course: TSimplifiedCourse

        inviter: User
    }
}

export class PagePassNotification extends AbstractProductNotification {
    type: NotificationTypes.pagePass

    details: {
        course: TSimplifiedCourse

        lesson: LessonUpdateDTO

        student: User,

        page: Pick<Page, 'name'|'_id'>
    }
}

export class FeedbackReceivedNotification extends AbstractProductNotification {
    type: NotificationTypes.feedbackReceived

    details: {
        course: TSimplifiedCourse

        lesson: LessonUpdateDTO

        teacher: User,

        page: Pick<Page, 'name'|'_id'>
    }
}

export type TGetNotificationsFilter = {
    userId: TUserId,
    offset: number,
    limit: number,
}

class AbstractCreateNotificationDTO {
    userId: string
}

export class CourseInvitationNotificationCreateDTO extends AbstractCreateNotificationDTO {
    type = NotificationTypes.courseInvitation

    details: {
        courseId: string

        inviterId: string
    }
}

export class PagePassNotificationCreateDTO extends AbstractCreateNotificationDTO {
    type = NotificationTypes.pagePass

    details: {
        courseId: string

        lessonId: string

        studentId: string

        pageId: string
    }
}

export class FeedbackReceivedNotificationCreateDTO extends AbstractCreateNotificationDTO {
    type = NotificationTypes.feedbackReceived

    details: {
        courseId: string

        lessonId: string

        teacherId: string

        pageId: string
    }
}

export type TCreateNotificationDTO = CourseInvitationNotificationCreateDTO |
PagePassNotificationCreateDTO |
FeedbackReceivedNotificationCreateDTO

export type TNotification = CourseInvitationNotification | PagePassNotification | FeedbackReceivedNotification

export class NotificationsResponse {
    @ApiProperty()
        notifications: TNotification[]

    @ApiProperty()
        pageInfo: PaginationInfo & {unreadCount: number}
}
