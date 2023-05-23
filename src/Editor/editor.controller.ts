import {
    Body, Controller, Delete, Get, Param, Post, Put
} from '@nestjs/common'
import { EditorService } from './editor.service'
import { AuthService } from '../Auth/auth.service'
import {
    GrantObjectType, Page, Lesson, LessonUpdateDTO
} from '../types/entities.types'
import { CourseDTO, PageCreateDTO } from '../types/editor.classes'

import { Token } from '../utils/extractToken'
import { Roles } from '../constants/general-roles'
import { RoleService } from '../Role/role.service'
import { ObjectIdValidationPipe } from '../utils/object-id'
import { throwForbidden } from '../utils/errors'
import { ApiResponse } from '@nestjs/swagger'
import {
    CourseCreateResponse, EditorLessonCreateResponse, EditorPageCreateResponse
} from '../types/outputs'
import {
    CourseResponse,
    LessonResponse
} from '../types/entities.types'

@Controller('/editor')
export class EditorController {
    constructor(
        private readonly editorService: EditorService,
        private readonly authService: AuthService,
        private readonly roleService: RoleService,
    ) {}

    // Courses
    @Post('courses/create')
    @ApiResponse({ status: 200, type: CourseCreateResponse })
    async createCourse(@Body() course: CourseDTO, @Token() token: string) {
        const userId = await this.authService.getUserId(token)
        const roles = await this.roleService.getUserRoles(userId)
        if (!roles.some(({ role }) => role === Roles.user)) {
            throwForbidden()
        }
        return this.editorService.createCourse(course, userId)
    }

    @Post('courses/:courseId')
    @ApiResponse({ status: 200, type: CourseCreateResponse })
    async updateCourse(
    @Param('courseId', ObjectIdValidationPipe) courseId,
        @Body() course: CourseDTO,
        @Token() token: string
    ) {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, courseId, GrantObjectType.course)
        if (!grant) {
            throwForbidden()
        }
        return this.editorService.updateCourse(courseId, course)
    }

    @Get('courses/:courseId')
    @ApiResponse({ status: 200, type: CourseResponse })
    async getCourse(@Param('courseId', ObjectIdValidationPipe) courseId, @Token() token: string) {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, courseId, GrantObjectType.course)
        if (!grant) {
            throwForbidden()
        }
        return this.editorService.getCourse(courseId)
    }

    @Get('courses')
    @ApiResponse({
        status: 200, isArray: true, type: CourseDTO
    })
    async getAvailableCourses(@Token() token: string) {
        const userId = await this.authService.getUserId(token)
        return this.editorService.getAvailableCourses(userId)
    }

    // Lessons
    @Post('lessons/create')
    @ApiResponse({ status: 200, type: EditorLessonCreateResponse })
    async createLesson(
        @Body() lesson: Lesson,
            @Token() token: string
    ): Promise<EditorLessonCreateResponse> {
        const userId = await this.authService.getUserId(token)
        const roles = await this.roleService.getUserRoles(userId)
        const grant = await this.editorService.checkGrants(userId, lesson.courseId.toString(), GrantObjectType.course)
        if (!grant || !roles.some(({ role }) => role === Roles.user)) {
            throwForbidden()
        }
        return this.editorService.createLesson(lesson, userId)
    }

    @Post('lessons/:lessonId')
    @ApiResponse({ status: 200, type: EditorLessonCreateResponse })
    async updateLesson(
        @Param('lessonId', ObjectIdValidationPipe) lessonId,
            @Body() lesson: LessonUpdateDTO,
            @Token() token: string
    ): Promise<EditorLessonCreateResponse> {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, lessonId, GrantObjectType.lesson)
        if (!grant) {
            throwForbidden()
        }
        return this.editorService.updateLesson(lesson)
    }

    @Get('lessons/:lessonId')
    @ApiResponse({ status: 200, type: LessonResponse })
    async getLesson(
        @Param('lessonId', ObjectIdValidationPipe) lessonId,
            @Token() token: string
    ): Promise<LessonResponse> {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, lessonId, GrantObjectType.lesson)
        if (!grant) {
            throwForbidden()
        }
        return this.editorService.getLesson(lessonId)
    }

    // Pages
    @Post('pages/create')
    @ApiResponse({ status: 200, type: EditorPageCreateResponse })
    async createPage(
        @Body() page: PageCreateDTO,
            @Token() token: string
    ): Promise<EditorPageCreateResponse> {
        const userId = await this.authService.getUserId(token)
        const roles = await this.roleService.getUserRoles(userId)
        const grant = await this.editorService.checkGrants(userId, page.lessonId.toString(), GrantObjectType.lesson)
        if (!grant || !roles.some(({ role }) => role === Roles.user)) {
            throwForbidden()
        }
        return this.editorService.createPage(page, userId)
    }

    @Put('pages/:pageId')
    @ApiResponse({ status: 200, type: EditorPageCreateResponse })
    async updatePage(
        @Param('pageId', ObjectIdValidationPipe) pageId,
            @Body() page: Page,
            @Token() token: string
    ): Promise<EditorPageCreateResponse> {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, pageId, GrantObjectType.page)
        if (!grant) {
            throwForbidden()
        }
        return this.editorService.updatePage(pageId, page)
    }

    @Get('pages/:pageId')
    @ApiResponse({ status: 200, type: Page })
    async getPage(
        @Param('pageId', ObjectIdValidationPipe) pageId,
            @Token() token: string
    ): Promise<Page> {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, pageId, GrantObjectType.page)
        if (!grant) {
            throwForbidden()
        }
        return this.editorService.getPage(pageId)
    }

    @Delete('pages/:pageId')
    async deletePage(
    @Param('pageId', ObjectIdValidationPipe) pageId,
        @Token() token: string
    ) {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, pageId, GrantObjectType.page)
        if (!grant) {
            throwForbidden()
        }
        return this.editorService.removePage(pageId)
    }
}
