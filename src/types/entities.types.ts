import { TEditorBlock } from './editor-content.types'

export type TCourseId = string
export type TLessonId = string
export type TPageId = string
export type TUserId = string

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
    lessonId: string,
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
