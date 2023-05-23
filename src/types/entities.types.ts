import { TEditorBlock } from './editor-content.types'
import { Roles } from '../constants/general-roles'
import { StudentTypes } from '../constants/student-types'
import { Types } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { CourseDTO } from './editor.classes'
import {
    IsBoolean,
    IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsString, ValidateNested
} from 'class-validator'
import { Type } from 'class-transformer'

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
    @ApiProperty({ isArray: true, type: ViewerLessonResponse })
        lessons: ViewerLessonResponse[]
}

export class CourseResponse extends CourseDTO {
    @ApiProperty({ isArray: true, type: LessonResponse })
        lessons: LessonResponse[]
}

export class CourseUpdateDTO extends CourseDTO {
    @ApiProperty()
        _id: TCourseId
}

export class EditorBlock {
    @ApiProperty()
        type: string

    @ApiProperty()
        data: unknown
}
class PageStructure {
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
}

export class Student {
    userId: TUserId

    teacherId: TUserId

    courseId: TCourseId

    type: StudentTypes
}

export enum AnswerTypes {
    radio= 'radio',
    check= 'check',
    text= 'text'
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
    type: AnswerTypes.check

    value: string[]
}

export class TextAnswer extends AnswerFeedback implements AbstractAnswerWithFeedback{
    type: AnswerTypes.text

    value: string
}

export type TAnswer = RadioAnswer | CheckAnswer | TextAnswer

export class AnswerWithId {
    @ApiProperty()
        id: string

    @ApiProperty({ type: AbstractAnswerWithFeedback })
        answer: TAnswer
}

export class AnswersDTO {
    @ApiProperty({ type: String })
        studentId: TUserId

    @ApiProperty({ type: String })
        pageId: TPageId

    @ApiProperty({ type: AnswerWithId, isArray: true })
        answers: AnswerWithId[]
}
