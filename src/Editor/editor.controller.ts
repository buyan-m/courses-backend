import {
    Body, Controller, Delete, Get, Param, Post, Res
} from '@nestjs/common'
import { EditorService } from './editor.service'
import { AuthService } from '../Auth/auth.service'
import { TGrantObjectType, TPage } from '../types/entities.types'
import {
    CourseDTO, LessonCreateDTO, LessonUpdateDTO, PageCreateDTO
} from '../types/editor.classes'
import { Token } from '../utils/extractToken'
import { roles as RolesEnum } from '../constants/general-roles'
import { Response } from 'express'
import { RoleService } from '../Role/role.service'

@Controller('/editor')
export class EditorController {
    constructor(
        private readonly editorService: EditorService,
        private readonly authService: AuthService,
        private readonly roleService: RoleService,
    ) {}

    // Courses
    @Post('courses/create')
    async createCourse(@Body() course: CourseDTO, @Token() token: string, @Res() response: Response) {
        const userId = await this.authService.getUserId(token)
        const roles = await this.roleService.getUserRoles(userId)
        if (!roles.some(({ role }) => role === RolesEnum.user)) {
            response.statusCode = 403
            response.send({})
        }
        return this.editorService.createCourse(course, userId)
    }

    @Post('courses/:courseId')
    async updateCourse(
    @Param('courseId') courseId,
        @Body() course: CourseDTO,
        @Token() token: string,
        @Res() response: Response
    ) {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, courseId, TGrantObjectType.course)
        if (!grant) {
            response.statusCode = 403
            response.send({})
        }
        response.send(await this.editorService.updateCourse(courseId, course))
    }

    @Get('courses/:courseId')
    async getCourse(@Param('courseId') courseId, @Token() token: string, @Res() response: Response) {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, courseId, TGrantObjectType.course)
        if (!grant) {
            response.statusCode = 403
            response.send({})
        }
        response.send(await this.editorService.getCourse(courseId))
    }

    @Get('courses')
    async getAvailableCourses(@Token() token: string) {
        const userId = await this.authService.getUserId(token)
        return this.editorService.getAvailableCourses(userId)
    }

    // Lessons
    @Post('lessons/create')
    async createLesson(@Body() lesson: LessonCreateDTO, @Token() token: string, @Res() response: Response) {
        const userId = await this.authService.getUserId(token)
        const roles = await this.roleService.getUserRoles(userId)
        const grant = await this.editorService.checkGrants(userId, lesson.courseId, TGrantObjectType.course)
        if (!grant || !roles.some(({ role }) => role === RolesEnum.user)) {
            response.statusCode = 403
            response.send({})
        }
        response.send(await this.editorService.createLesson(lesson, userId))
    }

    @Post('lessons/:lessonId')
    async updateLesson(
    @Param('lessonId') lessonId,
        @Body() lesson: LessonUpdateDTO,
        @Token() token: string,
        @Res() response: Response
    ) {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, lessonId, TGrantObjectType.lesson)
        if (!grant) {
            response.statusCode = 403
            response.send({})
        }
        response.send(await this.editorService.updateLesson(lesson))
    }

    @Get('lessons/:lessonId')
    async getLesson(@Param('lessonId') lessonId, @Token() token: string, @Res() response: Response) {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, lessonId, TGrantObjectType.lesson)
        if (!grant) {
            response.statusCode = 403
            response.send({})
        }
        response.send(await this.editorService.getLesson(lessonId))
    }

    // Pages
    @Post('pages/create')
    async createPage(@Body() page: PageCreateDTO, @Token() token: string, @Res() response: Response) {
        const userId = await this.authService.getUserId(token)
        const roles = await this.roleService.getUserRoles(userId)
        const grant = await this.editorService.checkGrants(userId, page.lessonId, TGrantObjectType.lesson)
        if (!grant || !roles.some(({ role }) => role === RolesEnum.user)) {
            response.statusCode = 403
            response.send({})
        }
        response.send(await this.editorService.createPage(page, userId))
    }

    @Post('pages/:pageId')
    async updatePage(@Param('pageId') pageId, @Body() page: TPage, @Token() token: string, @Res() response: Response) {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, pageId, TGrantObjectType.page)
        if (!grant) {
            response.statusCode = 403
            response.send({})
        }
        response.send(await this.editorService.updatePage(pageId, page))
    }

    @Get('pages/:pageId')
    async getPage(@Param('pageId') pageId, @Token() token: string, @Res() response: Response) {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, pageId, TGrantObjectType.page)
        if (!grant) {
            response.statusCode = 403
            response.send({})
        }
        response.send(await this.editorService.getPage(pageId))
    }

    @Delete('pages/:pageId')
    async deletePage(@Param('pageId') pageId, @Token() token: string, @Res() response: Response) {
        const userId = await this.authService.getUserId(token)
        const grant = await this.editorService.checkGrants(userId, pageId, TGrantObjectType.page)
        if (!grant) {
            response.statusCode = 403
            response.send({})
        }
        response.send(await this.editorService.removePage(pageId))
    }
}
