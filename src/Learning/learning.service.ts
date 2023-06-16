import {
    HttpException, HttpStatus, Inject, Injectable
} from '@nestjs/common'
import { FilterQuery, Model } from 'mongoose'
import {
    Teacher, Student, Page, Lesson, TUserId, PageAnswers, TCourseId
} from '../types/entities.types'
import { StudentTypes } from '../constants/student-types'
import {
    CourseAndStudentDTO, LearningPageDTO, TUpdateFeedbackDTO
} from './learning.classes'
import { throwForbidden, throwNotFound } from '../utils/errors'
import { TAnswer } from '../types/entities.types'
import { OkResponse } from '../utils/emptyResponse'
import { AnswerStates } from '../constants/answer-states'
import { TeacherTypes } from '../constants/teacher-types'

@Injectable()
export class LearningService {
    constructor(
        @Inject('STUDENT_MODEL')
        private studentModel: Model<Student>,
        @Inject('TEACHER_MODEL')
        private teacherModel: Model<Teacher>,
        @Inject('PAGE_MODEL')
        private pageModel: Model<Page>,
        @Inject('LESSON_MODEL')
        private lessonModel: Model<Lesson>,
        @Inject('ANSWER_MODEL')
        private answerModel: Model<PageAnswers>,
    ) {}

    async inviteStudent(teacherId: TUserId, courseAndStudentDTO: CourseAndStudentDTO) {
        // отправить инвайт, а не создать сразу
        const doc = await this.studentModel.findOne( {
            ...courseAndStudentDTO,
            teacherId
        })

        if (doc) {
            doc.type = StudentTypes.active
            return doc.save()
        }

        return new this.studentModel( {
            ...courseAndStudentDTO,
            teacherId,
            type: StudentTypes.active
        }).save()
    }

    archiveStudent (teacherId: TUserId, courseAndStudentDTO: CourseAndStudentDTO) {
        return this.studentModel.findOneAndUpdate( {
            ...courseAndStudentDTO,
            teacherId,
            type: StudentTypes.active
        }, { $set: { type: StudentTypes.archive } })
    }

    getTeacherStudents(teacherId: TUserId, courseId?: string) {
        const filter: FilterQuery<Student> = {
            teacherId,
            type: StudentTypes.active
        }
        if (courseId) {
            filter.courseId = courseId
        }
        return this.studentModel.find(filter).select('courseId userId')
    }

    async becomeTeacher(courseId: TCourseId, teacherId: TUserId): Promise<Teacher> {
        const teacher = await this.teacherModel.findOne({
            userId: teacherId,
            courseId
        })

        if (!teacher) {
            return new this.teacherModel( {
                userId: teacherId,
                courseId,
                type: TeacherTypes.active
            }).save()
        }

        if (teacher.type === TeacherTypes.archive) {
            teacher.type = TeacherTypes.active
            return teacher.save()
        }

        return teacher
    }

    archiveTeacher(courseId: TCourseId, teacherId: TUserId) {
        return this.teacherModel.findOneAndUpdate({
            userId: teacherId,
            courseId
        }, { $set: { type: TeacherTypes.archive } })
    }

    async saveAnswers({
        studentId, pageId, answers
    }: PageAnswers) {
        const doc = await this.answerModel.findOne({
            pageId,
            studentId,
            status: AnswerStates.active
        })

        if (doc) {
            throw new HttpException('Error: Forbidden', HttpStatus.FORBIDDEN)
        }

        return new this.answerModel({
            studentId,
            pageId,
            answers,
            status: AnswerStates.active
        }).save()
    }

    async getOwnAnswers(userId: TUserId, pageId: string) {
        return this.getAnswers({
            teacherId: userId,
            pageId,
            studentId: userId.toString()
        })
    }

    async getAnswers({
        teacherId, pageId, studentId
    }: LearningPageDTO) {
        const isLearningAvailable = await this.checkTeacherForStudent({
            teacherId, studentId, pageId
        })

        if (!isLearningAvailable && teacherId.toString() !== studentId) {
            throwForbidden()
        }

        const answers = await this.answerModel.findOne({
            studentId,
            pageId,
            status: AnswerStates.active
        })

        if (answers) {
            return answers
        }
        throwNotFound()
    }

    async checkTeacherForStudent ({
        teacherId, studentId, pageId
    }: LearningPageDTO) {
        const page = await this.pageModel
            .findById(pageId)
            .select('lessonId')
            .populate<{ lessonId: Lesson }>('lessonId', 'courseId')

        return await this.studentModel.find({
            teacherId, studentId, courseId: page.lessonId.courseId, type: StudentTypes.active
        }).count() === 1
    }

    async updateFeedback({
        teacherId, studentId, pageId, feedback
    }: TUpdateFeedbackDTO) {
        const isLearningAvailable = await this.checkTeacherForStudent({
            teacherId, studentId, pageId
        })
        if (isLearningAvailable) {
            const answerDoc = await this.answerModel.findOne({
                studentId,
                pageId,
                status: AnswerStates.active
            })
            if (!answerDoc) {
                throwNotFound()
            }
            // а если заново курс проходить? или одновременно с двумя учителями?
            const idIndex: Record<string, TAnswer> = answerDoc.answers.reduce((acc, el) => {
                acc[el.id] = el.answer
                return acc
            }, {})

            Object.entries(feedback).forEach(([ id, answer ]) => {
                idIndex[id].correctness = answer.correctness
                idIndex[id].feedback = answer.feedback
            })
            answerDoc.save()
            return
        }
        throwForbidden()
    }

    async resetAnswers({
        teacherId, studentId, pageId
    }: LearningPageDTO) {
        const isLearningAvailable = await this.checkTeacherForStudent({
            teacherId, studentId, pageId
        })

        if (!isLearningAvailable) {
            throwForbidden()
        }

        return this.answerModel.findOneAndUpdate(
            {
                studentId,
                pageId,
                status: AnswerStates.active
            },
            { $set: { status: AnswerStates.archive } }
        )
    }
}
