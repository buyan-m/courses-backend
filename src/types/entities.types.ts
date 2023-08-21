import { TEditorBlock } from './editor-content.types'
import { Roles } from '../constants/general-roles'
import { StudentTypes } from '../constants/student-types'
import { Types } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { CourseDTO } from './editor.classes'
import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNotEmptyObject,
    IsNumber,
    IsObject,
    IsString,
    ValidateNested
} from 'class-validator'
import { Type } from 'class-transformer'

import { TeacherTypes } from '../constants/teacher-types'
import { CourseRoles } from '../Learning/learning.classes'

export type TCourseId = Types.ObjectId
export type TLessonId = Types.ObjectId
export type TPageId = Types.ObjectId
export type TUserId = Types.ObjectId

export enum GrantObjectType {
    'course' = 'course',
    'lesson' = 'lesson',
    'page' = 'page'
}

export class Grant {
    userId: TUserId

    objectId: TCourseId | TLessonId | TPageId

    objectType: GrantObjectType
}

export class User {
    _id: TUserId

    name: string
}

class OmittedPage {
    @ApiProperty()
        name: string

    @ApiProperty({ type: String })
        lessonId: TLessonId

    @ApiProperty()
        position: number
}
export class Lesson {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
        name: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
        courseId: TCourseId
}

export class LessonUpdateDTO extends Lesson {
    @ApiProperty()
        _id: TLessonId
}

export class LessonResponse extends LessonUpdateDTO {
    @ApiProperty({ isArray: true, type: OmittedPage })
        pages: OmittedPage[]
}

export class ViewerLessonResponse extends LessonResponse {
    @ApiProperty()
        completed: boolean
}

export class ViewerCourseResponse extends CourseDTO {
    @ApiProperty({ type: String })
        _id: TCourseId

    @ApiProperty({ isArray: true, type: ViewerLessonResponse })
        lessons: ViewerLessonResponse[]

    @ApiProperty({ type: String, enum: Object.keys(CourseRoles) })
        role: CourseRoles
}

export class EditorCourseResponse extends CourseDTO {
    @ApiProperty({ type: String })
        _id: TCourseId

    @ApiProperty({ isArray: true, type: LessonResponse })
        lessons: LessonResponse[]
}

export class CourseUpdateDTO extends CourseDTO {
    @ApiProperty()
        _id: TCourseId
}

export class EditorBlock {
    @IsString()
    @ApiProperty()
        id: string

    @IsString()
    @ApiProperty()
        type: string

    @ApiProperty()
        data: unknown
}
export class PageStructure {
    @IsString()
    @ApiProperty()
        version: string

    @IsNumber()
    @ApiProperty()
        time: number

    @ApiProperty({ isArray: true, type: EditorBlock })
        blocks: TEditorBlock[]
}
export class Page {
    @ApiProperty()
    @IsString()
        _id: TPageId

    @ApiProperty({ type: PageStructure })
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => PageStructure)
        structure: PageStructure

    @ApiProperty()
    @IsString()
        name: string

    @ApiProperty()
    @IsBoolean()
        isAnswersVisible: boolean

    @ApiProperty({ type: String })
    @IsString()
        lessonId: TLessonId

    @ApiProperty()
    @IsNumber()
        position: number

    @ApiProperty()
    @IsBoolean()
        requireManualChecking: boolean
}

export class PageViewerDTO extends Page {
    @ApiProperty() nextPageAvailable: boolean

    @ApiProperty() progress: {
        checked: boolean
    }
}

export class NextPage {
    @ApiProperty({ type: String })
        pageId: TPageId
}

export class Auth {
    userId: TUserId

    email: string

    password: string
}

export class Token {
    token: string

    userId: TUserId

    validTill: Date
}

export class Progress {
    userId: TUserId

    objectId: TCourseId | TLessonId | TPageId

    objectType: GrantObjectType

    checked = false
}

export class Role {
    userId: TUserId

    role: Roles
}

export class Teacher {
    userId: TUserId

    courseId: TCourseId

    type: TeacherTypes
}

export class Student {
    userId: TUserId

    teacherId: TUserId

    courseId: TCourseId

    type: StudentTypes
}

export enum AnswerTypes {
    radio= 'radio',
    checkbox= 'checkbox',
    input= 'input'
}

export enum AnswerCorrectness {
    'correct' = 'correct',
    'incorrect' = 'incorrect',
    'not-verified' = 'not-verified'
}

export class AnswerFeedback {
    @ApiProperty({ enum: AnswerCorrectness })
        correctness: AnswerCorrectness

    @ApiProperty()
        feedback: string|undefined
}

abstract class AbstractAnswerWithFeedback extends AnswerFeedback{
    @IsString()
    @ApiProperty()
        type: string

    @ApiProperty()
        value: unknown
}

export class RadioAnswer extends AnswerFeedback implements AbstractAnswerWithFeedback {
    type: AnswerTypes.radio

    value: string
}

export class CheckAnswer extends AnswerFeedback implements AbstractAnswerWithFeedback{
    type: AnswerTypes.checkbox

    value: string[]
}

export class TextAnswer extends AnswerFeedback implements AbstractAnswerWithFeedback{
    type: AnswerTypes.input

    value: string
}

export type TAnswer = RadioAnswer | CheckAnswer | TextAnswer

export class AnswerWithId {
    @IsString()
    @ApiProperty()
        id: string

    @Type(() => AbstractAnswerWithFeedback)
    @ApiProperty({ type: AbstractAnswerWithFeedback })
        answer: TAnswer
}

export class AnswersDTO {
    @IsArray()
    @ValidateNested()
    @Type(() => AnswerWithId)
    @ApiProperty({ type: AnswerWithId, isArray: true })
        answers: AnswerWithId[]
}

export class PageAnswers extends AnswersDTO {
    @ApiProperty({ type: String })
        _id: string

    @IsString()
    @ApiProperty({ type: String })
        studentId: string

    @IsString()
    @ApiProperty({ type: String })
        pageId: string

    @IsBoolean()
    @ApiProperty({ type: Boolean })
        checked: boolean
}

export class PaginationInfo {
    @IsNumber()
    @ApiProperty({ type: Number })
        totalCount: number
}

export class EmailConfirmation {
    email: string

    code: string

    validTill: Date
}

export type TPaginated<T> = {
    items: T[],
    count: number
}
