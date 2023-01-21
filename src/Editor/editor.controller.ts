import {
    Controller, Post, Get, Delete, Param, Body, Req
} from '@nestjs/common'
import { EditorService } from './editor.service'
import { AuthService } from '../Auth/auth.service'
import {
    TCourseUpdateDTO, TCourseDTO, TLesson, TPage, TLessonUpdateDTO
} from '../types/entities.types'
import { CourseDTO } from '../types/editor.classes'
import { Request } from 'express'

@Controller('/editor')
export class EditorController {
    constructor(
        private readonly editorService: EditorService,
        private readonly authService: AuthService,
    ) {}

    // Courses
    @Post('courses/create')
    async createCourse(@Body() course: CourseDTO, @Req() request: Request) {
        const userId = await this.authService.getUserId(request.cookies.token)
        return this.editorService.createCourse(course, userId)
    }

    @Post('courses/:courseId')
    updateCourse(@Param('courseId') courseId, @Body() course: TCourseUpdateDTO) {
        // check grants
        return this.editorService.updateCourse(courseId, course)
    }

    @Get('courses/:courseId')
    getCourse(@Param('courseId') courseId) {
        return this.editorService.getCourse(courseId)
    }

    @Get('courses')
    async getAvailableCourses(@Req() request: Request) {
        const userId = await this.authService.getUserId(request.cookies.token)
        return this.editorService.getAvailableCourses(userId)
    }

    // Lessons
    @Post('lessons/create')
    async createLesson(@Body() lesson: TLesson, @Req() request: Request) {
        const userId = await this.authService.getUserId(request.cookies.token)
        return this.editorService.createLesson(lesson, userId)
    }

    @Post('lessons/:lessonId')
    updateLesson(@Param('lessonId') lessonId, @Body() lesson: TLessonUpdateDTO) {
        // check grants
        return this.editorService.updateLesson(lesson)
    }

    @Get('lessons/:lessonId')
    getLesson(@Param('lessonId') lessonId) {
        return this.editorService.getLesson(lessonId)
    }

    // Pages
    @Post('pages/create')
    async createPage(@Body() page: TPage, @Req() request: Request) {
        const userId = await this.authService.getUserId(request.cookies.token)
        return this.editorService.createPage(page, userId)
    }

    @Post('pages/:pageId')
    updatePage(@Param('pageId') pageId, @Body() page: TPage) {
        // check grants
        return this.editorService.updatePage(pageId, page)
    }

    @Get('pages/:pageId')
    getPage(@Param('pageId') pageId) {
        return this.editorService.getPage(pageId)
    }

    @Delete('pages/:pageId')
    deletePage(@Param('pageId') pageId) {
        // check grants
        return this.editorService.removePage(pageId)
    }
}
