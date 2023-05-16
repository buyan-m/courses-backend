import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import {
    TCourseId,
    TUserId,
    Grant,
    GrantObjectType,
    User,
    Lesson,
    Page,
    TPageId,
    TLessonId,
    LessonUpdateDTO,
    CourseResponse,
    LessonResponse
} from '../types/entities.types'
import { CourseDTO, PageCreateDTO } from '../types/editor.classes'
import { throwNotFound } from '../utils/errors'
import { CourseCreateResponse } from '../types/outputs'

@Injectable()
export class EditorService {
    constructor(
        @Inject('COURSE_MODEL')
        private courseModel: Model<CourseDTO>,
        @Inject('GRANT_MODEL')
        private grantModel: Model<Grant>,
        @Inject('USER_MODEL')
        private userModel: Model<User>,
        @Inject('LESSON_MODEL')
        private lessonModel: Model<Lesson>,
        @Inject('PAGE_MODEL')
        private pageModel: Model<Page>
    ) {}

    async createCourse(course: CourseDTO, userId: TUserId): Promise<CourseCreateResponse> {
        const createdCourse = await new this.courseModel(course)
        await Promise.all([
            new this.grantModel({
                objectId: createdCourse._id,
                objectType: GrantObjectType['course'],
                userId
            }).save(),
            createdCourse.save()
        ])
        return { courseId: createdCourse._id }
    }

    async updateCourse(courseId: TCourseId, course: CourseDTO): Promise<CourseCreateResponse> {
        await this.courseModel.findByIdAndUpdate(courseId, course)
        return { courseId }
    }

    getCourse(courseId: TCourseId): Promise<CourseResponse> {
        return Promise.all([
            this.lessonModel.find({ courseId })
                .then(async (lessons) => {
                    const ids = lessons.map(({ _id }) => _id)
                    const pages = await this.pageModel.find<Page>({ lessonId: { $in: ids } })
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

    getAvailableCourses(userId: TUserId): Promise<CourseDTO[]> {
        return this.grantModel.find<Grant>({ userId, objectType: GrantObjectType['course'] })
            .then((els) => {
                return Promise.all(els.map(({ objectId }) => this.courseModel.findById(objectId)))
                    .then(courses => courses.filter((course) => course))
            })
    }

    async createLesson(lesson: Lesson, userId: TUserId) {
        const createdLesson = new this.lessonModel(lesson)

        await Promise.all([
            createdLesson.save(),
            new this.grantModel({
                objectId: createdLesson._id,
                objectType: GrantObjectType['lesson'],
                userId: userId
            }).save()
        ])
        return { lessonId: createdLesson._id }
    }

    async updateLesson(lesson: LessonUpdateDTO) {
        await this.lessonModel.findByIdAndUpdate(lesson._id, lesson)
        return { lessonId: lesson._id }
    }

    getLesson(lessonId: TLessonId): Promise<LessonResponse> {
        return Promise.all([
            this.lessonModel.findById(lessonId),
            this.pageModel.find({ lessonId })
                .select('name lessonId position')
                .sort('position')
        ]).then(([ lesson, pages ]) => ({
            _id: lesson._id,
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
                objectType: GrantObjectType['page'],
                userId: userId
            }).save()
        ])
        return { pageId: createdPage._id }
    }

    async updatePage(pageId: TPageId, page: Page) {
        await this.pageModel.findByIdAndUpdate(pageId, page)
        return { pageId }
    }

    getPage(pageId: TPageId) {
        return this.pageModel.findById(pageId)
    }

    removePage(pageId) {
        return this.pageModel.findByIdAndRemove(pageId)
    }

    checkGrants(userId: TUserId, entityId: string, entityType: GrantObjectType) {
        return this.grantModel.find({
            userId,
            objectId: entityId,
            objectType: entityType
        }).count()
    }
}
