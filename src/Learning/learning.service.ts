import {
    HttpException, HttpStatus, Inject, Injectable
} from '@nestjs/common'
import { Model } from 'mongoose'
import {
    TTeacher, TStudent, TPage, TLesson, TUserId, TAnswersDTO, TCourseId
} from '../types/entities.types'
import { StudentTypes } from '../constants/student-types'
import { CourseAndStudentDTO } from './learning.classes'
import { throwForbidden } from '../utils/errors'

@Injectable()
export class LearningService {
    constructor(
        @Inject('STUDENT_MODEL')
        private studentModel: Model<TStudent>,
        @Inject('TEACHER_MODEL')
        private teacherModel: Model<TTeacher>,
        @Inject('PAGE_MODEL')
        private pageModel: Model<TPage>,
        @Inject('LESSON_MODEL')
        private lessonModel: Model<TLesson>,
        @Inject('ANSWER_MODEL')
        private answerModel: Model<TAnswersDTO>,
    ) {}

    inviteStudent(teacherId: TUserId, courseAndStudentDTO: CourseAndStudentDTO):Promise<TStudent> {
        // отправить инвайт, а не создать сразу
        return new this.studentModel( {
            ...courseAndStudentDTO,
            teacherId,
            type: StudentTypes.active
        }).save()
    }

    becameTeacher(courseId: TCourseId, teacherId: TUserId): Promise<TTeacher> {
        return new this.teacherModel( {
            userId: teacherId,
            courseId
        }).save()
    }

    async saveAnswers({
        studentId, pageId, answers
    }: TAnswersDTO) {
        const doc = await this.answerModel.findOne({ pageId, studentId })

        if (doc) {
            throw new HttpException('Error: Forbidden', HttpStatus.FORBIDDEN)
        }

        return new this.answerModel({
            studentId,
            pageId,
            answers
        }).save()
    }

    async getOwnAnswers(userId: TUserId, pageId: string) {
        return this.getAnswers(userId, pageId, userId)
    }

    async getAnswers(userId: TUserId, pageId: string, studentId: TUserId) {
        const page = await this.pageModel
            .findById(pageId)
            .select('lessonId')
            .populate<{ lessonId: TLesson }>('lessonId', 'courseId')

        const student = await this.studentModel.findOne({
            userId, studentId, courseId: page.lessonId.courseId
        })

        if (!student && userId !== studentId) {
            throwForbidden()
        }

        return this.answerModel.findOne({
            studentId,
            pageId
        })

        // todo feedback
    }
}
