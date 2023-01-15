import {
    Controller, Get, Param
} from '@nestjs/common'
import { ViewerService } from './viewer.service'
import {
    TCourseId, TLessonId, TPageId
} from '../types/entities.types'

@Controller('/viewer')
export class ViewerController {
    constructor(private readonly viewerService: ViewerService) {}

    @Get('courses/:courseId')
    getCourse(@Param('courseId') courseId: TCourseId) {
        return this.viewerService.getCourse(courseId)
    }

    @Get('lessons/:lessonId')
    getLesson(@Param('lessonId') lessonId: TLessonId) {
        return this.viewerService.getLesson(lessonId)
    }

    @Get('pages/:pageId')
    getPage(@Param('pageId') pageId: TPageId) {
        return this.viewerService.getPage(pageId)
    }

    @Get('pages/:pageId/next')
    getNextPage(@Param('pageId') pageId: TPageId) {
        return this.viewerService.getNextPage(pageId)
    }
}
