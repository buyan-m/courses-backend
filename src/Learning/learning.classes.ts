import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { AnswerCorrectness, TUserId } from '../types/entities.types'

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

export type TAnswerFeedback = {
    correctness: AnswerCorrectness,
    feedback?: string,
}

export type TUpdateFeedbackDTO = {
    teacherId,
    studentId,
    pageId,
    feedback: Record<string, TAnswerFeedback>
}

export class LearningPageDTO {
    @IsString()
    @IsNotEmpty()
        teacherId: TUserId

    @IsString()
    @IsNotEmpty()
        studentId: string

    @IsString()
    @IsNotEmpty()
        pageId: string
}
