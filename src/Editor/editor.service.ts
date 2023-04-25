import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import {
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
import { CourseDTO, PageCreateDTO } from '../types/editor.classes'
import { throwNotFound } from '../utils/errors'

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

    async updateCourse(courseId: TCourseId, course: CourseDTO) {
        await this.courseModel.findByIdAndUpdate(courseId, course)
        return { courseId }
    }

    getCourse(courseId: TCourseId): Promise<TCourseDTO> {
        return Promise.all([
            this.lessonModel.find({ courseId })
                .then(async (lessons) => {
                    const ids = lessons.map(({ _id }) => _id)
                    const pages = await this.pageModel.find<TPage>({ lessonId: { $in: ids } })
                        .select('name lessonId position')
                    return lessons.map((lesson) => {
                        return {
                            ...lesson.toObject(),
                            // todo use Map
                            pages: pages.filter(({ lessonId }) => lessonId.toString() === lesson._id.toString())
                        }
                    })
                }),
            this.courseModel.findById( courseId )
        ]).then(([ lessons, course ]) => {
            if (!course) {
                throwNotFound()
            }
            return {
                ...course.toObject(),
                lessons
            }
        })
    }

    getAvailableCourses(userId: TUserId) {
        return this.grantModel.find<TGrant>({ userId, objectType: TGrantObjectType['course'] })
            .then((els) => {
                return Promise.all(els.map(({ objectId }) => this.courseModel.findById(objectId)))
                    .then(courses => courses.filter((course) => course))
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
        return this.lessonModel.findByIdAndUpdate(lesson._id, lesson)
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

    async createPage(page: PageCreateDTO, userId: TUserId) {
        const index = await this.pageModel.find({ lessonId: page.lessonId }).count()
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

    checkGrants(userId: TUserId, entityId: string, entityType: TGrantObjectType) {
        return this.grantModel.find({
            userId,
            objectId: entityId,
            objectType: entityType
        }).count()
    }
}
