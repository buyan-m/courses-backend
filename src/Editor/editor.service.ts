import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import {
    TCourseUpdateDTO,
    TCourseDTO,
    TCourseId,
    TUserId,
    TGrant,
    TGrantObjectType,
    TUser,
    TLesson,
    TPage,
    TPageId,
    TLessonId,
    TLessonUpdateDTO
} from '../types/entities.types'

@Injectable()
export class EditorService {
    constructor(
        @Inject('COURSE_MODEL')
        private courseModel: Model<TCourseDTO>,
        @Inject('GRANT_MODEL')
        private grantModel: Model<TGrant>,
        @Inject('USER_MODEL')
        private userModel: Model<TUser>,
        @Inject('LESSON_MODEL')
        private lessonModel: Model<TLesson>,
        @Inject('PAGE_MODEL')
        private pageModel: Model<TPage>
    ) {}

    async createCourse(course: TCourseDTO, userId: TUserId) {
        const createdCourse = await new this.courseModel(course)
        await Promise.all([
            new this.grantModel({
                objectId: createdCourse._id,
                objectType: TGrantObjectType['course'],
                userId
            }).save(),
            createdCourse.save()
        ])
        return { courseId: createdCourse._id }
    }

    updateCourse(courseId: TCourseId, course: TCourseUpdateDTO) {
        return this.courseModel.findByIdAndUpdate(courseId, course)
    }

    getCourse(courseId: TCourseId): Promise<TCourseDTO> {
        return Promise.all([
            this.lessonModel.find<TLesson>({ courseId }),
            this.courseModel.findById<TCourseDTO>( courseId )
        ]).then(([ lessons, course ]) => {
            return {
                name: course.name,
                lessons
            }
        })

    }

    getAvailableCourses(userId: TUserId) {
        return this.grantModel.find<TGrant>({ userId, objectType: TGrantObjectType['course'] })
            .then((els) => {
                return Promise.all(els.map(({ objectId }) => this.courseModel.findById(objectId)))
            })
    }

    async createLesson(lesson: TLesson, userId: TUserId) {
        const createdLesson = new this.lessonModel(lesson)

        await Promise.all([
            createdLesson.save(),
            new this.grantModel({
                objectId: createdLesson._id,
                objectType: TGrantObjectType['lesson'],
                userId: userId
            }).save()
        ])
        return { lessonId: createdLesson._id }
    }

    async updateLesson(lesson: TLessonUpdateDTO) {
        return this.lessonModel.findByIdAndUpdate(lesson.id, lesson)
    }

    getLesson(lessonId: TLessonId): Promise<TLesson> {
        return Promise.all([
            this.lessonModel.findById<TLesson>(lessonId),
            this.pageModel.find<TPage>({ lessonId }).sort('position')
        ]).then(([ lesson, pages ]) => ({
            name: lesson.name,
            courseId: lesson.courseId,
            pages
        }))
    }

    async createPage(page: TPage, userId: TUserId) {
        const index = this.lessonModel.find({ lesson: page.lesson }).count()
        const createdPage = new this.pageModel({
            ...page,
            position: index
        })

        await Promise.all([
            createdPage.save(),
            new this.grantModel({
                objectId: createdPage._id,
                objectType: TGrantObjectType['page'],
                userId: userId
            }).save()
        ])
        return { pageId: createdPage._id }
    }

    updatePage(pageId: TPageId, page: TPage) {
        return this.pageModel.findByIdAndUpdate(pageId, page)
    }

    getPage(pageId: TPageId) {
        return this.pageModel.findById(pageId)
    }

    removePage(pageId) {
        return this.pageModel.findByIdAndRemove(pageId)
    }
}
