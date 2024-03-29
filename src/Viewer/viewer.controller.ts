import {
    Controller, Get, Post, Param, Query
} from '@nestjs/common'
import { ViewerService } from './viewer.service'
import { NextPage } from '../types/entities.types'
import {
    ViewerCourseResponse, ViewerLessonResponse, PageViewerDTO as ViewerPageResponse
} from '../types/entities.types'
import { AuthService } from '../Auth/auth.service'
import { Token } from '../utils/extractToken'
import { ObjectIdValidationPipe } from '../utils/object-id'
import { ApiResponse } from '@nestjs/swagger'

@Controller('/viewer')
export class ViewerController {
    constructor(private readonly viewerService: ViewerService, private readonly authService: AuthService) {}

    @Get('courses/featured')
    @ApiResponse({ status: 200, type: ViewerCourseResponse })
    async getFeaturedCourses(@Token() token: string) {
        const userId = await this.authService.getUserId(token)
        // todo: make a list of courses

        return this.viewerService.getCourse('63f093f2fa45c64e433940b9', userId)
    }

    @Get('courses/search')
    @ApiResponse({
        status: 200, type: ViewerCourseResponse, isArray: true
    })
    searchCourse(@Query('text') text: string) {
        return this.viewerService.searchCourse(decodeURIComponent(text))
    }

    @Get('courses/:courseId')
    @ApiResponse({ status: 200, type: ViewerCourseResponse })
    async getCourse(@Param('courseId', ObjectIdValidationPipe) courseId: string, @Token() token: string) {
        const userId = await this.authService.getUserId(token)

        return await this.viewerService.getCourse(courseId, userId)
    }

    @Get('lessons/:lessonId')
    @ApiResponse({ status: 200, type: ViewerLessonResponse })
    getLesson(@Param('lessonId', ObjectIdValidationPipe) lessonId: string) {
        return this.viewerService.getLesson(lessonId)
    }

    @Get('pages/:pageId')
    @ApiResponse({ status: 200, type: ViewerPageResponse })
    async getPage(@Param('pageId', ObjectIdValidationPipe) pageId: string, @Token() token: string) {
        const userId = await this.authService.getUserId(token)
        return this.viewerService.getPage(pageId, userId)
    }

    @Post('pages/:pageId/next')
    @ApiResponse({ type: NextPage })
    async completePage(
        @Param('pageId', ObjectIdValidationPipe) pageId: string,
            @Token() token: string
    ): Promise<NextPage> {
        const userId = await this.authService.getUserId(token)
        await this.viewerService.completePage(pageId, userId)
        return this.viewerService.getNextPage(pageId)
    }

    @Post('lessons/:lessonId/complete')
    async completeLesson(
        @Param('lessonId', ObjectIdValidationPipe) lessonId: string,
            @Token() token: string
    ): Promise<void> {
        const userId = await this.authService.getUserId(token)
        return this.viewerService.completeLesson(lessonId, userId)
    }
}
