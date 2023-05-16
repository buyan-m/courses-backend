import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import {
    Grant,
    Lesson,
    Page,
    User,
    NextPage,
    PageViewerDTO,
    Progress,
    GrantObjectType,
    ViewerCourseResponse,
    ViewerLessonResponse
} from '../types/entities.types'
import { CourseDTO } from '../types/editor.classes'
import { throwNotFound } from '../utils/errors'

@Injectable()
export class ViewerService {
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
        private pageModel: Model<Page>,
        @Inject('PROGRESS_MODEL')
        private progressModel: Model<Progress>
    ) {}

    getCourse(courseId, userId): Promise<ViewerCourseResponse> {
        return Promise.all([
            this.courseModel.findById(courseId),
            this.lessonModel.find({ courseId })
            // this.teachersModel.find(...) как поделиться статистикой? как вдвоем вести одну группу?
            // может отдельную ручку? в этом модуле или в дополнительном?
            // надо нарисовать схему взаимодейтсвия
        ]).then(([ course, lessons ]) => {
            if (!course) {
                throwNotFound()
            }
            return Promise.all(lessons.map(
                (lesson) => {
                    return Promise.all([
                        this.pageModel
                            .find({ lessonId: lesson._id })
                            .select('name lessonId position'),
                        this.progressModel.findOne({
                            userId,
                            objectId: lesson.id,
                            objectType: GrantObjectType.lesson
                        })
                    ]).then(([ pages, progress ]) => {
                        return {
                            ...lesson.toObject(),
                            pages: pages,
                            completed: !!progress
                        } as ViewerLessonResponse
                    })
                }
            ))
                .then((lessons) => {
                    return {
                        ...course.toObject(),
                        lessons
                    }
                })
        })
    }

    getLesson(lessonId): Promise<Lesson> {
        return Promise.all([
            this.lessonModel.findById(lessonId),
            this.pageModel.find({ lessonId }).sort('position')
        ]).then(([ lesson, pages ]) => {
            return {
                name: lesson.name,
                courseId: lesson.courseId,
                pages
            }
        })
    }

    getPage(pageId, userId): Promise<PageViewerDTO> {
        const pagePromise = this.pageModel.findById(pageId).exec()

        return Promise.all([
            pagePromise,
            pagePromise
                .then((page) => {
                    return this.pageModel.find({ lessonId: page.lessonId }).count()
                }),

            this.progressModel.find({
                userId,
                objectId: pageId,
                objectType: GrantObjectType.page
            })
        ]).then(([ page, length, progress ]) => {
            return {
                ...page.toObject(),
                nextPageAvailable: length - 1 > page.position,
                progress: { checked: !!progress }
            }
        })

    }

    async getNextPage(pageId): Promise<NextPage> {
        // todo remove bottleneck
        const page = await this.pageModel.findById(pageId)
        const neededPage = await this.pageModel.findOne({
            lessonId: page.lessonId,
            position: page.position + 1
        })

        if (!neededPage) {
            // 404
        }

        return { pageId: neededPage._id }
    }

    searchCourse(text) {
        return this.courseModel.find({ $text: { $search: text } })
    }

    async completePage(pageId, userId) {
        const alreadyRecorded = await this.progressModel.exists({
            userId,
            objectId: pageId,
            objectType: GrantObjectType.page
        })
        if (!alreadyRecorded) {
            return await new this.progressModel({
                userId,
                objectId: pageId,
                objectType: GrantObjectType.page
            }).save()
        }
        return
    }

    async completeLesson(lessonId, userId) {
        await new this.progressModel({
            userId,
            objectId: lessonId,
            objectType: GrantObjectType.lesson
        }).save()
    }
}
