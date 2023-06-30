import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import {
    NotificationStates,
    NotificationTypes,
    TGetNotificationsFilter,
    TNotification,
    NotificationsResponse,
    PagePassNotification,
    PagePassNotificationCreateDTO,
    CourseInvitationNotification,
    CourseInvitationNotificationCreateDTO,
    FeedbackReceivedNotification,
    FeedbackReceivedNotificationCreateDTO, TCreateNotificationDTO
} from './notification.classes'
import { TUserId } from '../types/entities.types'
import { DEV_MODE } from '../constants/dev-mode'
import { throwForbidden } from '../utils/errors'

const NOTIFICATIONS_LIMIT_PER_PAGE = 3

@Injectable()
export class NotificationService {
    constructor(
        @Inject('NOTIFICATION_MODEL')
        private notificationModel: Model<TNotification>,
        @Inject('COURSE_INVITATION_NOTIFICATION_MODEL')
        private courseInvitationNotificationModel: Model<CourseInvitationNotification['details']>,
        @Inject('PAGE_PASS_NOTIFICATION_MODEL')
        private pagePassNotificationModel: Model<PagePassNotification['details']>,
        @Inject('FEEDBACK_RECEIVED_NOTIFICATION_MODEL')
        private feedbackReceivedNotificationModel: Model<FeedbackReceivedNotification['details']>
    ) {}

    async getNotifications({ userId }: TGetNotificationsFilter): Promise<NotificationsResponse> {
        const response = await this.notificationModel
            .aggregate([ { $match: { user: userId } } ])
            .facet({
                notifications: [
                    { $sort: { cdate: -1 } },
                    { $limit: NOTIFICATIONS_LIMIT_PER_PAGE },
                    {
                        $lookup: {
                            from: 'users', localField: 'user', foreignField: '_id', as: 'user'
                        }
                    }
                ],
                pageInfo: [ { $count: 'totalCount' } ]
            })

        const unreadCount = await this.notificationModel.find({
            user: userId,
            status: NotificationStates.new
        }).count()

        const populatedNotifications = await Promise.all(
            response[0].notifications.map(async (notification: TNotification) => {
                if (notification.type === NotificationTypes.courseInvitation) {
                    return {
                        ...notification,
                        details: await this.courseInvitationNotificationModel
                            .findById(notification.details)
                            .populate('course', 'name')
                            .populate('inviter', 'name')
                    } as CourseInvitationNotification
                }

                if (notification.type === NotificationTypes.pagePass) {
                    return {
                        ...notification,
                        details: await this.pagePassNotificationModel
                            .findById(notification.details)
                            .populate('course', 'name _id')
                            .populate('lesson', 'name _id')
                            .populate('student', 'name _id')
                            .populate('page', 'name _id')
                    } as PagePassNotification
                }

                if (notification.type === NotificationTypes.feedbackReceived) {
                    return {
                        ...notification,
                        details: await this.feedbackReceivedNotificationModel
                            .findById(notification.details)
                            .populate('course', 'name _id')
                            .populate('lesson', 'name _id')
                            .populate('teacher', 'name _id')
                            .populate('page', 'name _id')
                    } as FeedbackReceivedNotification
                }

                return notification as TNotification
            })
        )
        const pageInfo = {
            unreadCount,
            totalCount: response[0].pageInfo[0]?.totalCount || 0
        }
        return {
            pageInfo,
            notifications: populatedNotifications
        }
    }

    async createNotification(
        createNotificationDTO: TCreateNotificationDTO
    ): Promise<TNotification> {
        let details = {}
        if (createNotificationDTO.type === NotificationTypes.courseInvitation) {
            details = await this.createCourseInvitationDetails(
                createNotificationDTO as CourseInvitationNotificationCreateDTO
            )
        }

        if (createNotificationDTO.type === NotificationTypes.pagePass) {
            details = await this.createPagePassDetails(
                createNotificationDTO as PagePassNotificationCreateDTO
            )
        }

        if (createNotificationDTO.type === NotificationTypes.feedbackReceived) {
            details = await this.createFeedbackReceivedDetails(
                createNotificationDTO as FeedbackReceivedNotificationCreateDTO
            )
        }
        return new this.notificationModel({
            user: createNotificationDTO.userId,
            type: createNotificationDTO.type,
            details,
            status: NotificationStates.new,
            cdate: new Date()
        }).save()
    }

    createCourseInvitationDetails(
        createNotificationDTO: CourseInvitationNotificationCreateDTO
    ): Promise<CourseInvitationNotification['details']> {
        const { courseId, inviterId } = createNotificationDTO.details
        return new this.courseInvitationNotificationModel({
            course: courseId,
            inviter: inviterId
        }).save()
    }

    createPagePassDetails(
        createNotificationDTO: PagePassNotificationCreateDTO
    ): Promise<PagePassNotification['details']> {
        const {
            courseId, lessonId, studentId, pageId
        } = createNotificationDTO.details

        return new this.pagePassNotificationModel({
            course: courseId,
            lesson: lessonId,
            student: studentId,
            page: pageId
        }).save()
    }

    createFeedbackReceivedDetails(
        createNotificationDTO: FeedbackReceivedNotificationCreateDTO
    ): Promise<FeedbackReceivedNotification['details']> {
        const {
            courseId, lessonId, teacherId, pageId
        } = createNotificationDTO.details

        return new this.feedbackReceivedNotificationModel({
            course: courseId,
            lesson: lessonId,
            teacher: teacherId,
            page: pageId
        }).save()
    }

    readAllNotifications(userId: TUserId) {
        return this.notificationModel.updateMany({ user: userId }, { $set: { status: NotificationStates.viewed } })
    }

    readNotification({ userId, notificationId }: {userId: TUserId, notificationId: string}) {
        return this.notificationModel.updateOne(
            { _id: notificationId, user: userId },
            { $set: { status: NotificationStates.viewed } }
        )
    }

    async deleteNotificationsForUser(userId: string) {
        if (!DEV_MODE) {
            throwForbidden()
        }

        const notifications = await this.notificationModel.find({ user: userId })
            .select('details type')

        const typeMap = notifications.reduce((res, el) => {
            if (!res[el.type]) res[el.type] = []
            res[el.type].push(el.details as unknown as string)
            return res
        }, {} as Record<NotificationTypes, string[]>)

        await Promise.all(
            Object.keys(typeMap)
                .map((type: NotificationTypes) => {
                    if (type === NotificationTypes.courseInvitation){
                        return this.courseInvitationNotificationModel.deleteMany({ _id: typeMap[type] })
                    }
                    if (type === NotificationTypes.pagePass){
                        return this.pagePassNotificationModel.deleteMany({ _id: typeMap[type] })
                    }
                    if (type === NotificationTypes.feedbackReceived){
                        return this.feedbackReceivedNotificationModel.deleteMany({ _id: typeMap[type] })
                    }
                })
        )

        await this.notificationModel.deleteMany({ user: userId })
    }
}
