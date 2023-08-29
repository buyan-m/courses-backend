import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import {
    AnswerCorrectness, PageAnswers, Progress, TLessonId, TPageId, TUserId, User, TCourseId
} from '../types/entities.types'

export enum CourseRoles {
    teacher = 'teacher',
    student = 'student',
    visitor = 'visitor',
    owner = 'owner'
}

export type TCourseStudentsResponse = TCourseStudentsResponseItem[]

export type TCourseStudentsResponseItem = {
    name: string,
    userId: TUserId,
    courseId: TCourseId,
    courseTitle: string
}

export class CourseAndStudentDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
        userId: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
        courseId: string
}

export class CourseAndShareCodeDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
        shareCode: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
        courseId: string
}

export type TAnswerFeedback = {
    correctness: AnswerCorrectness,
    feedback?: string,
}

export type TUpdateFeedbackDTO = {
    teacherId: string,
    studentId: string,
    pageId: string,
    feedback: Record<string, TAnswerFeedback>
}

export class LearningPageDTO {
    @IsString()
    @IsNotEmpty()
        teacherId: string

    @IsString()
    @IsNotEmpty()
        studentId: string

    @IsString()
    @IsNotEmpty()
        pageId: string
}

export class LearningCourseDTO {
    @IsString()
    @IsNotEmpty()
        teacherId: string

    @IsString()
    @IsNotEmpty()
        studentId: string

    @IsString()
    @IsNotEmpty()
        courseId: string
}

export type TGetTeacherStudentsInput = {
    teacherId: TUserId

    courseId?: string
}

export type TGetStudentDetailsInput = {
    teacherId: TUserId

    courseId: string

    studentId: string,

    onlyUnchecked?: boolean
}

export class DetailedStudentCourseInfo {
    @ApiProperty({ type: () => Array })
        answerPages: Pick<PageAnswers, '_id'|'checked'>[]

    @ApiProperty({ type: () => User })
        student: User

    @ApiProperty()
        progress: {
        lessons: {
            _id: TLessonId,
            pages: { _id: TPageId, name: string }[]
            name: string
        }[],
        progress: Progress[]
    }
}
