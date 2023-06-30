import {
    Body, Controller, Delete, Get, Param, Post, Put
} from '@nestjs/common'
import { Token } from '../utils/extractToken'
import { LearningService } from './learning.service'
import {
    CourseAndShareCodeDTO, CourseAndStudentDTO, TUpdateFeedbackDTO
} from './learning.classes'
import { AuthService } from '../Auth/auth.service'
import {
    AnswersDTO, PageAnswers, Student, TCourseId
} from '../types/entities.types'
import { ObjectIdValidationPipe } from '../utils/object-id'
import { ApiResponse } from '@nestjs/swagger'
import { OkResponse } from '../utils/emptyResponse'
import { ShareCodeService } from '../ShareCode/share-code.service'
import { NotificationService } from '../Notification/notification.service'
import { FeedbackReceivedNotificationCreateDTO, NotificationTypes } from '../Notification/notification.classes'
import { ViewerService } from '../Viewer/viewer.service'

@Controller('learning')
export class LearningController {
    constructor(
        private readonly learningService: LearningService,
        private readonly authService: AuthService,
        private readonly shareCodeService: ShareCodeService,
        private readonly notificationService: NotificationService,
        private readonly viewerService: ViewerService,
    ) {}

    @Post('invite')
    async inviteStudent(
        @Body() courseAndShareCodeDTO: CourseAndShareCodeDTO,
            @Token() token: string
    ): Promise<OkResponse> {
        // проверить учитель ли этот пользователь
        const teacherId = await this.authService.getUserId(token)
        const result = await this.shareCodeService.checkCode(courseAndShareCodeDTO.shareCode)
        await this.learningService.inviteStudent(teacherId, {
            userId: result.userId.toString(),
            courseId: courseAndShareCodeDTO.courseId
        })

        // Может быть асинхронной очередью в дальнейшем
        await this.notificationService.createNotification({
            userId: result.userId.toString(),
            type: NotificationTypes.courseInvitation,
            details: {
                courseId: courseAndShareCodeDTO.courseId,
                inviterId: teacherId.toString()
            }
        })
        return new OkResponse()
    }

    @Put('archive-student')
    async archiveStudent(@Body() studentAndCourseIds: CourseAndStudentDTO, @Token() token: string) {
        // нужно в сервисе поставить у студента тип "архивный"
        const teacherId = await this.authService.getUserId(token)
        await this.learningService.archiveStudent(teacherId, studentAndCourseIds)
        return new OkResponse()
    }

    @Get('students')
    @ApiResponse({ type: Student, isArray: true })
    async getOwnStudents(@Token() token: string): Promise<Student[]> {
        const teacherId = await this.authService.getUserId(token)
        return this.learningService.getTeacherStudents(teacherId)
    }

    @Put('become-teacher/:courseId')
    async becomeTeacher(
        @Param('courseId', ObjectIdValidationPipe) courseId: TCourseId,
            @Token() token: string
    ): Promise<OkResponse> {
        const teacherId = await this.authService.getUserId(token)
        await this.learningService.becomeTeacher(courseId, teacherId)
        return new OkResponse()
    }

    @Put('archive-teacher/:courseId')
    async archiveTeacher(
    @Param('courseId', ObjectIdValidationPipe) courseId: TCourseId,
        @Token() token: string
    ) {
        const teacherId = await this.authService.getUserId(token)
        await this.learningService.archiveTeacher(courseId, teacherId)
        return new OkResponse()
    }

    @Put('save-answers/:pageId')
    async savePageAnswers(
    @Param('pageId', ObjectIdValidationPipe) pageId: string,
        @Token() token: string,
        @Body() body: AnswersDTO
    ) {
        const studentId = await this.authService.getUserId(token)
        // Кажется нужно еще чекать версию документа
        const answers = await this.learningService.saveAnswers({
            studentId: studentId.toString(),
            pageId: pageId,
            answers: body.answers
        })

        // можно вынести в очередь потом
        try {
            const page = await this.viewerService.getCourseIdByPageId(pageId)
            const teachers = await this.learningService.getStudentTeachers({
                studentId: studentId.toString(),
                courseId: page.lessonId.courseId.toString()
            })

            await Promise.all(teachers.map((teacher) => (
                this.notificationService.createNotification({
                    userId: teacher.teacherId.toString(),
                    type: NotificationTypes.pagePass,
                    details: {
                        courseId: page.lessonId.courseId.toString(),
                        lessonId: page.lessonId._id.toString(),
                        studentId: studentId.toString(),
                        pageId: pageId
                    }
                })
            )))
        }
        catch (e) {}

        return answers
    }

    @Delete('answers/:pageId/:studentId')
    async resetAnswers(
    @Param('pageId', ObjectIdValidationPipe) pageId: string,
        @Param('studentId', ObjectIdValidationPipe) studentId: string,
        @Token() token: string,
        @Body() comment?: unknown
    ) {
        const teacherId = await this.authService.getUserId(token)

        await this.learningService.resetAnswers({
            teacherId: teacherId.toString(), studentId, pageId
        })

        // комментарий в систему оповещений отправить
        return new OkResponse()
    }

    @Get('answers/:pageId')
    @ApiResponse({ type: PageAnswers })
    async getOwnSavedAnswers(
        @Param('pageId', ObjectIdValidationPipe) pageId: string,
            @Token() token: string
    ): Promise<PageAnswers> {
        const studentId = await this.authService.getUserId(token)
        return this.learningService.getOwnAnswers(studentId, pageId)
    }

    @Get('answers/:pageId/:studentId')
    @ApiResponse({ type: PageAnswers })
    async getSavedAnswers(
        @Param('pageId', ObjectIdValidationPipe) pageId: string,
            @Param('studentId', ObjectIdValidationPipe) studentId: string,
            @Token() token: string
    ): Promise<PageAnswers> {
        const userId = await this.authService.getUserId(token)
        return this.learningService.getAnswers({
            teacherId: userId.toString(), pageId, studentId
        })
    }

    @Put('answers-feedback/:pageId/:studentId')
    async createFeedbackToAnswers(
    @Param('pageId', ObjectIdValidationPipe) pageId: string,
        @Param('studentId', ObjectIdValidationPipe) studentId: string,
        @Token() token: string,
        @Body() feedback: TUpdateFeedbackDTO['feedback']
    ) {
        const teacherId = await this.authService.getUserId(token)
        await this.learningService.updateFeedback({
            teacherId: teacherId.toString(),
            studentId,
            pageId,
            feedback
        })

        const page = await this.viewerService.getCourseIdByPageId(pageId)
        // можно вынести в очередь потом
        await this.notificationService.createNotification({
            userId: studentId,
            type: NotificationTypes.feedbackReceived,
            details: {
                courseId: page.lessonId.courseId.toString(),
                lessonId: page.lessonId._id.toString(),
                teacherId: teacherId.toString(),
                pageId: pageId
            }
        } as FeedbackReceivedNotificationCreateDTO)

        return new OkResponse()
    }
}
