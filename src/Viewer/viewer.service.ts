import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import {
    Grant,
    GrantObjectType,
    Lesson,
    LessonUpdateDTO,
    NextPage,
    Page,
    PageViewerDTO,
    Progress,
    Student,
    TCourseId,
    Teacher,
    TUserId,
    User,
    ViewerCourseResponse,
    ViewerLessonResponse
} from '../types/entities.types'
import { CourseDTO } from '../types/editor.classes'
import { throwNotFound } from '../utils/errors'
import { CourseRoles } from '../Learning/learning.classes'
import { StudentTypes } from '../constants/student-types'
import { TeacherTypes } from '../constants/teacher-types'

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
        private progressModel: Model<Progress>,
        @Inject('TEACHER_MODEL')
        private teacherModel: Model<Teacher>,
        @Inject('STUDENT_MODEL')
        private studentModel: Model<Student>
    ) {}

    getCourse(courseId: string, userId: TUserId): Promise<ViewerCourseResponse> {
        return Promise.all([
            this.courseModel.findById(courseId),
            this.lessonModel.find({ courseId }),
            this.getUserRoleInCourse({ userId, courseId })
        ]).then(([
            course,
            lessons,
            role
        ]) => {
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
                        role,
                        lessons
                    }
                })
        })
    }

    getLesson(lessonId: string): Promise<Lesson> {
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

    getPage(pageId: string, userId: TUserId): Promise<PageViewerDTO> {
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

    async getNextPage(pageId: string): Promise<NextPage> {
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

    searchCourse(text: string) {
        return this.courseModel.find({ $text: { $search: text } })
    }

    async completePage(pageId:string, userId: TUserId) {
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

    async completeLesson(lessonId: string, userId: TUserId) {
        const alreadyRecorded = await this.progressModel.exists({
            userId,
            objectId: lessonId,
            objectType: GrantObjectType.lesson
        })
        if (!alreadyRecorded) {
            await new this.progressModel({
                userId,
                objectId: lessonId,
                objectType: GrantObjectType.lesson
            }).save()
        }
    }

    async getCourseIdByPageId(pageId: string) {
        const page = await this.pageModel
            .findById(pageId)
            .populate<{ lessonId: LessonUpdateDTO }>('lessonId', '_id courseId')

        if (page) {
            return page
        }

        throwNotFound()
    }

    async getUserRoleInCourse({ userId, courseId }: {userId: TUserId|string, courseId: TCourseId|string}) {
        return Promise.all([
            this.teacherModel.findOne({
                courseId, userId, type: TeacherTypes.active
            }),
            this.studentModel.findOne({
                courseId, userId, type: StudentTypes.active
            }),
            this.grantModel.findOne({
                objectId: courseId,
                objectType: GrantObjectType.course,
                userId
            })
        ]).then(([ teaching, studying, owning ]) => {
            if (owning) {
                return CourseRoles.owner
            }
            if (teaching) {
                return CourseRoles.teacher
            }
            if (studying) {
                return CourseRoles.student
            }

            return CourseRoles.visitor
        })
    }
}
