import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import {
    TCourseDTO,
    TGrant,
    TLesson,
    TPage,
    TUser,
    TNextPage,
    TPageViewerDTO,
    TProgress,
    TGrantObjectType,
    TCourseResponse,
    TLessonResponse
} from '../types/entities.types'

@Injectable()
export class ViewerService {
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
        private pageModel: Model<TPage>,
        @Inject('PROGRESS_MODEL')
        private progressModel: Model<TProgress>
    ) {}

    getCourse(courseId, userId): Promise<TCourseResponse> {
        return Promise.all([
            this.courseModel.findById(courseId),
            this.lessonModel.find({ courseId })
        ]).then(([ course, lessons ]) => {
            return Promise.all(lessons.map(
                (lesson) => {
                    return Promise.all([
                        this.pageModel
                            .find({ lessonId: lesson._id })
                            .select('name lessonId position'),
                        this.progressModel.findOne({
                            userId,
                            objectId: lesson.id,
                            objectType: TGrantObjectType.lesson
                        })
                    ]).then(([ pages, progress ]) => {
                        return {
                            ...lesson.toObject(),
                            pages: pages,
                            completed: !!progress
                        } as TLessonResponse
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

    getLesson(lessonId): Promise<TLesson> {
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

    getPage(pageId, userId): Promise<TPageViewerDTO> {
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
                objectType: TGrantObjectType.page
            })
        ]).then(([ page, length, progress ]) => {
            return {
                ...page.toObject(),
                nextPageAvailable: length - 1 > page.position,
                progress: { checked: !!progress }
            }
        })

    }

    async getNextPage(pageId): Promise<TNextPage> {
        // todo remove bottleneck
        const page = await this.pageModel.findById(pageId)
        const neededPage = await this.pageModel.findOne({
            lessonId: page.lessonId,
            position: page.position + 1
        }).exec()

        if (!neededPage) {
            // 404
        }

        return { pageId: neededPage._id.toString() }
    }

    searchCourse(text) {
        return this.courseModel.find({ $text: { $search: text } })
    }

    async completePage(pageId, userId) {
        const alreadyRecorded = await this.progressModel.exists({
            userId,
            objectId: pageId,
            objectType: TGrantObjectType.page
        })
        if (!alreadyRecorded) {
            return await new this.progressModel({
                userId,
                objectId: pageId,
                objectType: TGrantObjectType.page
            }).save()
        }
        return undefined
    }

    async completeLesson(lessonId, userId) {
        await new this.progressModel({
            userId,
            objectId: lessonId,
            objectType: TGrantObjectType.lesson
        }).save()
    }
}
