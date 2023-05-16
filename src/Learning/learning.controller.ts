import {
    Body, Controller, Delete, Get, Param, Post, Put
} from '@nestjs/common'
import { Token } from '../utils/extractToken'
import { LearningService } from './learning.service'
import { CourseAndStudentDTO, TUpdateFeedbackDTO } from './learning.classes'
import { AuthService } from '../Auth/auth.service'
import {
    AnswersDTO, Student, TCourseId, PageAnswers
} from '../types/entities.types'
import { ObjectIdValidationPipe } from '../utils/object-id'
import { ApiResponse } from '@nestjs/swagger'
import { OkResponse } from '../utils/emptyResponse'

@Controller('learning')
export class LearningController {
    constructor(
        private readonly learningService: LearningService,
        private readonly authService: AuthService,
    ) {}

    @Post('invite')
    async inviteStudent(
        @Body() courseAndStudentDTO: CourseAndStudentDTO,
            @Token() token: string
    ): Promise<OkResponse> {
        // проверить учитель ли этот пользователь
        const teacherId = await this.authService.getUserId(token)
        await this.learningService.inviteStudent(teacherId, courseAndStudentDTO)
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

    @Post('became-teacher/:courseId')
    async becameTeacher(
        @Param('courseId', ObjectIdValidationPipe) courseId: TCourseId,
            @Token() token: string
    ): Promise<OkResponse> {
        const teacherId = await this.authService.getUserId(token)
        await this.learningService.becameTeacher(courseId, teacherId)
        return new OkResponse()
    }

    @Put('save-answers/:pageId')
    async savePageAnswers(
    @Param('pageId', ObjectIdValidationPipe) pageId,
        @Token() token: string,
        @Body() body: AnswersDTO
    ) {
        const studentId = await this.authService.getUserId(token)
        // Кажется нужно еще чекать версию документа
        return this.learningService.saveAnswers({
            studentId,
            pageId,
            answers: body.answers
        })
    }

    @Delete('answers/:pageId/:studentId')
    async resetAnswers(
    @Param('pageId', ObjectIdValidationPipe) pageId,
        @Param('studentId', ObjectIdValidationPipe) studentId,
        @Token() token: string,
        @Body() comment?: unknown
    ) {
        const teacherId = await this.authService.getUserId(token)

        await this.learningService.resetAnswers({
            teacherId, studentId, pageId
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
        @Param('pageId', ObjectIdValidationPipe) pageId,
            @Param('studentId', ObjectIdValidationPipe) studentId,
            @Token() token: string
    ): Promise<PageAnswers> {
        // пойти в сервис и забрать ответы, которые уже есть на странице + фидбэк
        const userId = await this.authService.getUserId(token)
        return this.learningService.getAnswers({
            teacherId: userId, pageId, studentId
        })
    }

    @Put('answers-feedback/:pageId/:studentId')
    async createFeedbackToAnswers(
    @Param('pageId', ObjectIdValidationPipe) pageId,
        @Param('studentId', ObjectIdValidationPipe) studentId,
        @Token() token: string,
        @Body() feedback: TUpdateFeedbackDTO['feedback']
    ) {
        const teacherId = await this.authService.getUserId(token)
        return this.learningService.updateFeedback({
            teacherId, studentId, pageId, feedback
        })
        // пойти в сервис и дополнить ответы фидбэком, проверкой и т.д.
    }
}
