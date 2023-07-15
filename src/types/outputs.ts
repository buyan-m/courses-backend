/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger'
import {
    TCourseId,
    TLessonId,
    TPageId,
    EditorCourseResponse,
    LessonResponse,
    ViewerLessonResponse,
    ViewerCourseResponse,
    NextPage,
    AnswersDTO as ViewerAnswersResponse,
    PageViewerDTO as ViewerPageResponse,
    Page,
    AnswerWithId,
    TAnswer,
    CheckAnswer,
    TextAnswer,
    AnswerFeedback,
    RadioAnswer,
    AnswerCorrectness
} from './entities.types'

import { TNotification } from '../Notification/notification.classes'

import { AuthCheckResponse } from './auth.classes'
import { Roles } from '../constants/general-roles'

import {
    EditorBlockType,
    TEditorBlockVideo,
    Option
} from './editor-content.types'

import {
    CourseAndStudentDTO,
    TAnswerFeedback,
    TUpdateFeedbackDTO,
    DetailedStudentCourseInfo
} from '../Learning/learning.classes'

import { ShareCodeDTO } from '../ShareCode/share-code.classes'

export class CourseCreateResponse {
    @ApiProperty({ type: String })
        courseId: TCourseId
}

export class EditorLessonCreateResponse {
    @ApiProperty({ type: String })
        lessonId: TLessonId
}

export class EditorPageCreateResponse {
    @ApiProperty({ type: String })
        pageId: TPageId
}
