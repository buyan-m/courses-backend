import {
    HttpException, HttpStatus, Inject, Injectable
} from '@nestjs/common'
import { FilterQuery, Model } from 'mongoose'
import {
    Teacher, Student, Page, Lesson, TUserId, PageAnswers, TCourseId, User, Progress, GrantObjectType
} from '../types/entities.types'
import { StudentTypes } from '../constants/student-types'
import {
    CourseAndStudentDTO,
    DetailedStudentCourseInfo,
    LearningCourseDTO,
    LearningPageDTO,
    TCourseStudentsResponse,
    TGetStudentDetailsInput,
    TGetTeacherStudentsInput,
    TUpdateFeedbackDTO
} from './learning.classes'
import { throwForbidden, throwNotFound } from '../utils/errors'
import { TAnswer } from '../types/entities.types'
import { AnswerStates } from '../constants/answer-states'
import { TeacherTypes } from '../constants/teacher-types'
import { CourseDTO } from '../types/editor.classes'

@Injectable()
export class LearningService {
    constructor(
        @Inject('STUDENT_MODEL')
        private studentModel: Model<Student>,
        @Inject('TEACHER_MODEL')
        private teacherModel: Model<Teacher>,
        @Inject('PAGE_MODEL')
        private pageModel: Model<Page>,
        @Inject('PROGRESS_MODEL')
        private progressModel: Model<Progress>,
        @Inject('LESSON_MODEL')
        private lessonModel: Model<Lesson>,
        @Inject('COURSE_MODEL')
        private courseModel: Model<CourseDTO>,
        @Inject('ANSWER_MODEL')
        private answerModel: Model<PageAnswers>,
        @Inject('USER_MODEL')
        private userModel: Model<User>,
    ) {}

    async inviteStudent(teacherId: TUserId, courseAndStudentDTO: CourseAndStudentDTO): Promise<User> {
        // отправить инвайт, а не создать сразу
        const doc = await this.studentModel.findOne( {
            ...courseAndStudentDTO,
            teacherId
        })

        if (doc) {
            doc.type = StudentTypes.active
            await doc.save()
            return this.userModel.findById(courseAndStudentDTO.userId).select('name')
        }

        const [ , user ] = await Promise.all([
            new this.studentModel( {
                ...courseAndStudentDTO,
                teacherId,
                type: StudentTypes.active
            }).save(),
            this.userModel.findById(courseAndStudentDTO.userId).select('name')
        ])

        return user
    }

    archiveStudent (teacherId: TUserId, courseAndStudentDTO: CourseAndStudentDTO) {
        return this.studentModel.findOneAndUpdate( {
            ...courseAndStudentDTO,
            teacherId,
            type: StudentTypes.active
        }, { $set: { type: StudentTypes.archive } })
    }

    async getTeacherStudents({ teacherId, courseId }: TGetTeacherStudentsInput): Promise<TCourseStudentsResponse> {
        const filter: FilterQuery<Student> = {
            teacherId,
            type: StudentTypes.active
        }
        if (courseId) {
            filter.courseId = courseId
        }
        const students = await this.studentModel.find(filter).select('courseId userId')
        const [ coursesMap, usersMap ] = await Promise.all([
            this.courseModel
                .find({ _id: { $in: students.map(({ courseId }) => courseId) } })
                .then((courses) => courses.reduce((res, course) => {
                    res[course._id.toString()] = course.toObject()
                    return res
                }, {} as Record<string, User>)),
            this.userModel
                .find({ _id: { $in: students.map(({ userId }) => userId) } })
                .then((users) => users.reduce((res, user) => {
                    res[user._id.toString()] = user.toObject()
                    return res
                }, {} as Record<string, User>))
        ])

        return students.map((student) => ({
            ...student.toObject(),
            name: usersMap[student.userId.toString()].name,
            courseTitle: coursesMap[student.courseId.toString()].name
        }))
    }

    async getStudentTeachers({ studentId, courseId }: {studentId: string, courseId: string}): Promise<Student[]> {
        return this.studentModel.find({
            type: StudentTypes.active,
            userId: studentId,
            courseId
        })
    }

    async getTeacherStudentDetails({
        teacherId, courseId, studentId, onlyUnchecked
    }: TGetStudentDetailsInput): Promise<DetailedStudentCourseInfo> {
        const isLearningAvailable = await this.checkTeacherForStudent({
            teacherId: teacherId.toString(),
            studentId,
            courseId
        })
        if (!isLearningAvailable) {
            throwForbidden()
        }

        const pages = await this.pageModel
            .find({ courseId }).select('_id lessonId')

        const answerModelFilter: FilterQuery<PageAnswers> = {
            studentId,
            pageId: { $in: pages.map(({ _id }) => _id) },
            status: AnswerStates.active
        }

        if (onlyUnchecked) {
            answerModelFilter.checked = false
        }

        return Promise.all([
            this.answerModel.find(answerModelFilter)
                .select('pageId checked'),
            this.userModel.findById(studentId),
            this.lessonModel.find({ courseId })
                .select('_id name')
                .then((lessons) => {
                    console.log(pages, lessons)
                    return this.progressModel.find({
                        objectId: { $in: lessons.map(({ _id }) => _id) },
                        objectType: GrantObjectType.lesson,
                        userId: studentId
                    })
                        .then((progress) => ({
                            lessons: lessons.map((lesson) => ({
                                ...lesson.toObject(),
                                pages: pages.filter(({ lessonId }) => lessonId.toString() === lesson._id.toString())
                            })),
                            progress
                        }))
                })
        ])
            .then(([
                answerPages,
                student,
                progress
            ]) => (
                {
                    answerPages,
                    student,
                    progress
                }
            ))
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
    }: Omit<PageAnswers, '_id'|'checked'>) {
        const doc = await this.answerModel.findOne({
            pageId,
            studentId,
            status: AnswerStates.active
        })

        if (doc) {
            throw new HttpException('Error: Forbidden', HttpStatus.FORBIDDEN)
        }

        const { requireManualChecking } = await this.pageModel.findById(pageId)
            .select('requireManualChecking')

        return new this.answerModel({
            studentId,
            pageId,
            answers,
            status: AnswerStates.active,
            checked: !requireManualChecking
        }).save()
    }

    async getOwnAnswers(userId: TUserId, pageId: string) {
        return this.getAnswers({
            teacherId: userId.toString(),
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
        teacherId, studentId, ...rest
    }: LearningPageDTO|LearningCourseDTO) {
        let courseId
        if ('courseId' in rest) {
            courseId = rest.courseId
        }
        else {
            const page = await this.pageModel
                .findById(rest.pageId)
                .select('lessonId')
                .populate<{ lessonId: Lesson }>('lessonId', 'courseId')
            courseId = page.lessonId.courseId
        }

        return await this.studentModel.find({
            teacherId, studentId, courseId: courseId, type: StudentTypes.active
        }).count() === 1
    }

    async updateFeedback({
        teacherId, studentId, pageId, feedback
    }: TUpdateFeedbackDTO) {
        const isLearningAvailable = await this.checkTeacherForStudent({
            teacherId: teacherId.toString(),
            studentId,
            pageId
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
            const idIndex = answerDoc.answers.reduce((acc, el) => {
                acc[el.id] = el.answer
                return acc
            }, {} as Record<string, TAnswer>)

            Object.entries(feedback).forEach(([ id, answer ]) => {
                idIndex[id].correctness = answer.correctness
                idIndex[id].feedback = answer.feedback
            })

            answerDoc.checked = true
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
