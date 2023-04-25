import {
    Body, Controller, Delete, Get, Param, Post
} from '@nestjs/common'
import { EditorService } from './editor.service'
import { AuthService } from '../Auth/auth.service'
import { TGrantObjectType, TPage } from '../types/entities.types'
import {
    CourseDTO, LessonCreateDTO, LessonUpdateDTO, PageCreateDTO
} from '../types/editor.classes'
import { Token } from '../utils/extractToken'
import { Roles } from '../constants/general-roles'
import { RoleService } from '../Role/role.service'
import { ObjectIdValidationPipe } from '../utils/object-id'
import { throwForbidden } from '../utils/errors'

@Controller('/editor')
export class EditorController {
    constructor(
        private readonly editorService: EditorService,
        private readonly authService: AuthService,
        private readonly roleService: RoleService,
    ) {}

    // Courses
    @Post('courses/create')
    async createCourse(@Body() course: CourseDTO, @Token() token: string) {
        const userId = await this.authService.getUserId(token)
        const roles = await this.roleService.getUserRoles(userId)
        if (!roles.some(({ role }) => role === Roles.user)) {
            throwForbidden()
        }
        return this.editorService.createCourse(course, userId)
    }

    @Post('courses/:courseId')
    async updateCourse(
    @Param('courseId', ObjectIdValidationPipe) courseId,
        @Body() course: CourseDTO,
        @Token() token: string
    ) {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, courseId, TGrantObjectType.course)
        if (!grant) {
            throwForbidden()
        }
        return this.editorService.updateCourse(courseId, course)
    }

    @Get('courses/:courseId')
    async getCourse(@Param('courseId', ObjectIdValidationPipe) courseId, @Token() token: string) {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, courseId, TGrantObjectType.course)
        if (!grant) {
            throwForbidden()
        }
        return this.editorService.getCourse(courseId)
    }

    @Get('courses')
    async getAvailableCourses(@Token() token: string) {
        const userId = await this.authService.getUserId(token)
        return this.editorService.getAvailableCourses(userId)
    }

    // Lessons
    @Post('lessons/create')
    async createLesson(@Body() lesson: LessonCreateDTO, @Token() token: string) {
        const userId = await this.authService.getUserId(token)
        const roles = await this.roleService.getUserRoles(userId)
        const grant = await this.editorService.checkGrants(userId, lesson.courseId.toString(), TGrantObjectType.course)
        if (!grant || !roles.some(({ role }) => role === Roles.user)) {
            throwForbidden()
        }
        return this.editorService.createLesson(lesson, userId)
    }

    @Post('lessons/:lessonId')
    async updateLesson(
    @Param('lessonId', ObjectIdValidationPipe) lessonId,
        @Body() lesson: LessonUpdateDTO,
        @Token() token: string
    ) {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, lessonId, TGrantObjectType.lesson)
        if (!grant) {
            throwForbidden()
        }
        return this.editorService.updateLesson(lesson)
    }

    @Get('lessons/:lessonId')
    async getLesson(@Param('lessonId', ObjectIdValidationPipe) lessonId, @Token() token: string) {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, lessonId, TGrantObjectType.lesson)
        if (!grant) {
            throwForbidden()
        }
        return this.editorService.getLesson(lessonId)
    }

    // Pages
    @Post('pages/create')
    async createPage(@Body() page: PageCreateDTO, @Token() token: string) {
        const userId = await this.authService.getUserId(token)
        const roles = await this.roleService.getUserRoles(userId)
        const grant = await this.editorService.checkGrants(userId, page.lessonId, TGrantObjectType.lesson)
        if (!grant || !roles.some(({ role }) => role === Roles.user)) {
            throwForbidden()
        }
        return this.editorService.createPage(page, userId)
    }

    @Post('pages/:pageId')
    async updatePage(@Param('pageId', ObjectIdValidationPipe) pageId, @Body() page: TPage, @Token() token: string) {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, pageId, TGrantObjectType.page)
        if (!grant) {
            throwForbidden()
        }
        return this.editorService.updatePage(pageId, page)
    }

    @Get('pages/:pageId')
    async getPage(@Param('pageId', ObjectIdValidationPipe) pageId, @Token() token: string) {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, pageId, TGrantObjectType.page)
        if (!grant) {
            throwForbidden()
        }
        return this.editorService.getPage(pageId)
    }

    @Delete('pages/:pageId')
    async deletePage(@Param('pageId', ObjectIdValidationPipe) pageId, @Token() token: string) {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, pageId, TGrantObjectType.page)
        if (!grant) {
            throwForbidden()
        }
        return this.editorService.removePage(pageId)
    }
}
