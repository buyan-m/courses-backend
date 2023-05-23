import {
    HttpException, HttpStatus, Inject, Injectable
} from '@nestjs/common'
import { Model } from 'mongoose'
import {
    Teacher, Student, Page, Lesson, TUserId, AnswersDTO, TCourseId
} from '../types/entities.types'
import { StudentTypes } from '../constants/student-types'
import { CourseAndStudentDTO } from './learning.classes'
import { throwForbidden } from '../utils/errors'

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
        private answerModel: Model<AnswersDTO>,
    ) {}

    async inviteStudent(teacherId: TUserId, courseAndStudentDTO: CourseAndStudentDTO):Promise<Student> {
        // отправить инвайт, а не создать сразу
        await new this.studentModel( {
            ...courseAndStudentDTO,
            teacherId,
            type: StudentTypes.active
        }).save()
        return
    }

    becameTeacher(courseId: TCourseId, teacherId: TUserId): Promise<Teacher> {
        return new this.teacherModel( {
            userId: teacherId,
            courseId
        }).save()
    }

    async saveAnswers({
        studentId, pageId, answers
    }: AnswersDTO) {
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
            .populate<{ lessonId: Lesson }>('lessonId', 'courseId')

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
