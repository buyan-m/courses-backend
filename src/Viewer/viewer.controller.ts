import {
    Controller, Get, Post, Param, Query, Req
} from '@nestjs/common'
import { ViewerService } from './viewer.service'
import {
    TCourseId, TLessonId, TPageId
} from '../types/entities.types'
import { AuthService } from '../Auth/auth.service'
import { Request } from 'express'

@Controller('/viewer')
export class ViewerController {
    constructor(private readonly viewerService: ViewerService, private readonly authService: AuthService) {}

    @Get('courses/featured')
    async getFeaturedCourses(@Req() request: Request) {
        const userId = await this.authService.getUserId(request.cookies.token)
        // todo: make a list of courses
        return this.viewerService.getCourse('63f093f2fa45c64e433940b9', userId)
    }

    @Get('courses/search')
    searchCourse(@Query('text') text: string) {
        return this.viewerService.searchCourse(decodeURIComponent(text))
    }

    @Get('courses/:courseId')
    async getCourse(@Req() request: Request, @Param('courseId') courseId: TCourseId) {
        const userId = await this.authService.getUserId(request.cookies.token)
        return this.viewerService.getCourse(courseId, userId)
    }

    @Get('lessons/:lessonId')
    getLesson(@Param('lessonId') lessonId: TLessonId) {
        return this.viewerService.getLesson(lessonId)
    }

    @Get('pages/:pageId')
    async getPage(@Req() request: Request, @Param('pageId') pageId: TPageId) {
        const userId = await this.authService.getUserId(request.cookies.token)
        return this.viewerService.getPage(pageId, userId)
    }

    @Post('pages/:pageId/next')
    async completePage(@Param('pageId') pageId: TPageId, @Req() request: Request) {
        const userId = await this.authService.getUserId(request.cookies.token)
        await this.viewerService.completePage(pageId, userId)
        return this.viewerService.getNextPage(pageId)
    }

    @Post('lessons/:lessonId/complete')
    async completeLesson(@Param('lessonId') lessonId: TLessonId, @Req() request: Request) {
        const userId = await this.authService.getUserId(request.cookies.token)
        return this.viewerService.completeLesson(lessonId, userId)
    }
}
