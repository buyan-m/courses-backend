import {
    Body, Controller, Get, Param, Post, Put
} from '@nestjs/common'
import { Token } from '../utils/extractToken'
import { LearningService } from './learning.service'
import { CourseAndStudentDTO } from './learning.classes'
import { AuthService } from '../Auth/auth.service'
import { TAnswersDTO } from '../types/entities.types'

@Controller('learning')
export class LearningController {
    constructor(
        private readonly learningService: LearningService,
        private readonly authService: AuthService,
    ) {}

    @Post('invite')
    async inviteStudent(@Body() courseAndStudentDTO: CourseAndStudentDTO, @Token() token: string) {
        // проверить учитель ли этот пользователь
        const teacherId = await this.authService.getUserId(token)
        return this.learningService.inviteStudent(teacherId, courseAndStudentDTO)
    }

    @Put('archive-student')
    archiveStudent(@Body() studentAndCourseIds: unknown, @Token() token: string) {
        // нужно в сервисе поставить у студента тип "архивный"
    }

    @Post('became-teacher/:courseId')
    async becameTeacher(@Param('courseId') courseId: string, @Token() token: string) {
        const teacherId = await this.authService.getUserId(token)
        await this.learningService.becameTeacher(courseId, teacherId)
        return {}
    }

    @Put('save-answers/:pageId')
    async savePageAnswers(@Param('pageId') pageId, @Token() token: string, @Body() body: TAnswersDTO) {
        const studentId = await this.authService.getUserId(token)
        // Кажется нужно еще чекать версию документа
        return this.learningService.saveAnswers({
            studentId,
            pageId,
            answers: body.answers
        })
    }

    @Post('reset-answers/:pageId')
    resetAnswers(@Param('pageId') pageId, @Token() token: string, @Body() commentAndStudentId: unknown) {
        // сбросить ответы ученика и дать общий комментарий
        // комментарий в систему оповещений отправить
    }

    @Get('answers/:pageId')
    async getOwnSavedAnswers(
    @Param('pageId') pageId: string,
        @Token() token: string
    ) {
        const studentId = await this.authService.getUserId(token)
        return this.learningService.getOwnAnswers(studentId, pageId)
    }

    @Get('answers/:pageId/:studentId')
    async getSavedAnswers(
    @Param('pageId') pageId,
        @Param('studentId') studentId,
        @Token() token: string
    ) {
        // пойти в сервис и забрать ответы, которые уже есть на странице + фидбэк
        const userId = await this.authService.getUserId(token)
        return this.learningService.getAnswers(userId, pageId, studentId)
    }

    @Put('answers-feedback/:pageId')
    createFeedbackToAnswers(@Param('pageId') pageId, @Token() token: string, @Body() feedback: unknown) {
        // пойти в сервис и дополнить ответы фидбэком, проверкой и т.д.
    }
}
