import { TEditorBlock } from './editor-content.types'
import { Roles } from '../constants/general-roles'
import { StudentTypes } from '../constants/student-types'
import { Types } from 'mongoose'

export type TCourseId = Types.ObjectId
export type TLessonId = Types.ObjectId
export type TPageId = Types.ObjectId
export type TUserId = Types.ObjectId

export enum TGrantObjectType {
    'course' = 'course',
    'lesson' = 'lesson',
    'page' = 'page'
}

export type TGrant = {
    userId: TUserId,
    objectId: TCourseId | TLessonId | TPageId,
    objectType: TGrantObjectType
}

export type TUser = {
    name: string
}

export type TCourseDTO = {
    name: string
}
export type TLessonResponse = {
    pages: Omit<TPage, 'structure'>[],
    completed: boolean
}

export type TCourseResponse = TCourseDTO & {
    lessons: TLessonResponse[]
}

export type TCourseUpdateDTO = TCourseDTO & {_id: TCourseId}

export type TLesson = {
    name: string,
    courseId: TCourseId
}

export type TLessonUpdateDTO = TLesson & {
    _id: TLessonId
}

export type TPage = {
    structure: {
        blocks: TEditorBlock[]
    },
    name: string,
    isAnswersVisible: boolean,
    lessonId: TLessonId,
    position: number
}

export type TPageViewerDTO = TPage & {
    nextPageAvailable: boolean,
    progress: {
        checked: boolean
    }
}

export type TNextPage = {
    pageId: TPageId,
}

export type TAuth = {
    userId: TUserId,
    email: string,
    password: string
}

export type TToken = {
    token: string,
    userId: TUserId,
    validTill: Date
}

export type TProgress = {
    userId: TUserId,
    objectId: TCourseId | TLessonId | TPageId,
    objectType: TGrantObjectType,
    checked: boolean
}

export type TRole = {
    userId: TUserId,
    role: Roles
}

export type TTeacher = {
    userId: TUserId
    courseId: TCourseId
}

export type TStudent = {
    userId: TUserId,
    teacherId: TUserId,
    courseId: TCourseId,
    type: StudentTypes
}
export enum AnswerTypes {
    radio= 'radio',
    check= 'check',
    text= 'text'
}

type TRadioAnswer = {
    type: AnswerTypes.radio,
    value: number
}

type TCheckAnswer = {
    type: AnswerTypes.check,
    value: number[]
}

type TTextAnswer = {
    type: AnswerTypes.text,
    value: string
}

export type TAnswer = TRadioAnswer | TCheckAnswer | TTextAnswer

export type TAnswersDTO = {
    studentId: TUserId,
    pageId: TPageId,
    answers: {
        id: string,
        answer: TAnswer
    }[]
}
