import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import {
    TCourseDTO, TGrant, TLesson, TPage, TUser, TNextPage, TPageId, TPageViewerDTO
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
        private pageModel: Model<TPage>
    ) {}

    getCourse(courseId): Promise<TCourseDTO> {
        return Promise.all([
            this.courseModel.findById(courseId),
            this.lessonModel.find({ courseId })
        ]).then(([ course, lessons ]) => {
            return {
                name: course.name,
                lessons
            }
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

    async getPage(pageId): Promise<TPageViewerDTO> {
        const page = await this.pageModel.findById(pageId)
        const length = await this.pageModel.find({ lessonId: page.lessonId }).count()

        return {
            ...page.toObject(),
            nextPageAvailable: length - 1 > page.position
        }
    }

    async getNextPage(pageId): Promise<TNextPage> {
        // todo remove bottleneck
        const page = await this.pageModel.findById(pageId).exec()
        const neededPage = await this.pageModel.findOne({
            lessonId: page.lessonId,
            position: page.position + 1
        }).exec()

        if (!neededPage) {
            // 404
        }

        return { pageId: neededPage._id as unknown as TPageId }
    }
}
