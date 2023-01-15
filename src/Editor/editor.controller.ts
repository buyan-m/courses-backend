import {
    Controller, Post, Get, Delete, Param, Body
} from '@nestjs/common'
import { EditorService } from './editor.service'
import {
    TCourseUpdateDTO, TCourseDTO, TLesson, TPage, TLessonUpdateDTO
} from '../types/entities.types'

@Controller('/editor')
export class EditorController {
    constructor(private readonly editorService: EditorService) {}

    // Courses
    @Post('courses/create')
    createCourse(@Body() course: TCourseDTO) {
        return this.editorService.createCourse(course, '63b56b23a0a35ed0f2b97ed8')
    }

    @Post('courses/:courseId')
    updateCourse(@Param('courseId') courseId, @Body() course: TCourseUpdateDTO) {
        return this.editorService.updateCourse(courseId, course)
    }

    @Get('courses/:courseId')
    getCourse(@Param('courseId') courseId) {
        return this.editorService.getCourse(courseId)
    }

    @Get('courses')
    getAvailableCourses() {
        return this.editorService.getAvailableCourses('63b56b23a0a35ed0f2b97ed8')
    }

    // Lessons
    @Post('lessons/create')
    createLesson(@Body() lesson: TLesson) {
        return this.editorService.createLesson(lesson, '63b56b23a0a35ed0f2b97ed8')
    }

    @Post('lessons/:lessonId')
    updateLesson(@Param('lessonId') lessonId, @Body() lesson: TLessonUpdateDTO) {
        return this.editorService.updateLesson(lesson)
    }

    @Get('lessons/:lessonId')
    getLesson(@Param('lessonId') lessonId) {
        return this.editorService.getLesson(lessonId)
    }

    // Pages
    @Post('pages/create')
    createPage(@Body() page: TPage) {
        return this.editorService.createPage(page, '63b56b23a0a35ed0f2b97ed8')
    }

    @Post('pages/:pageId')
    updatePage(@Param('pageId') pageId, @Body() page: TPage) {
        return this.editorService.updatePage(pageId, page)
    }

    @Get('pages/:pageId')
    getPage(@Param('pageId') pageId) {
        return this.editorService.getPage(pageId)
    }

    @Delete('pages/:pageId')
    deletePage(@Param('pageId') pageId) {
        return this.editorService.removePage(pageId)
    }
}
