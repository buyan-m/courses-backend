import {
    Controller, Get, Post, Param, Query
} from '@nestjs/common'
import { ViewerService } from './viewer.service'
import {
    TCourseId, TLessonId, TPageId
} from '../types/entities.types'
import { AuthService } from '../Auth/auth.service'
import { Token } from '../utils/extractToken'
import { ObjectIdValidationPipe } from '../utils/object-id'

@Controller('/viewer')
export class ViewerController {
    constructor(private readonly viewerService: ViewerService, private readonly authService: AuthService) {}

    @Get('courses/featured')
    async getFeaturedCourses(@Token() token: string) {
        const userId = await this.authService.getUserId(token)
        // todo: make a list of courses

        return this.viewerService.getCourse('63f093f2fa45c64e433940b9', userId)
    }

    @Get('courses/search')
    searchCourse(@Query('text') text: string) {
        return this.viewerService.searchCourse(decodeURIComponent(text))
    }

    @Get('courses/:courseId')
    async getCourse(@Param('courseId', ObjectIdValidationPipe) courseId: TCourseId, @Token() token: string) {
        const userId = await this.authService.getUserId(token)

        return await this.viewerService.getCourse(courseId, userId)
    }

    @Get('lessons/:lessonId')
    getLesson(@Param('lessonId', ObjectIdValidationPipe) lessonId: TLessonId) {
        return this.viewerService.getLesson(lessonId)
    }

    @Get('pages/:pageId')
    async getPage(@Param('pageId', ObjectIdValidationPipe) pageId: TPageId, @Token() token: string) {
        const userId = await this.authService.getUserId(token)
        return this.viewerService.getPage(pageId, userId)
    }

    @Post('pages/:pageId/next')
    async completePage(@Param('pageId', ObjectIdValidationPipe) pageId: TPageId, @Token() token) {
        const userId = await this.authService.getUserId(token)
        await this.viewerService.completePage(pageId, userId)
        return this.viewerService.getNextPage(pageId)
    }

    @Post('lessons/:lessonId/complete')
    async completeLesson(@Param('lessonId', ObjectIdValidationPipe) lessonId: TLessonId, @Token() token: string) {
        const userId = await this.authService.getUserId(token)
        return this.viewerService.completeLesson(lessonId, userId)
    }
}
