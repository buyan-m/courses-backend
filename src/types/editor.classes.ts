import { IsNotEmpty, IsString } from 'class-validator'
import { TCourseId, TLessonId } from './entities.types'
import { TEditorBlock } from './editor-content.types'

export class CourseDTO {
    @IsString()
    @IsNotEmpty()
        name: string

    @IsString()
    @IsNotEmpty()
        description: string
}

export class LessonCreateDTO {
    @IsString()
    @IsNotEmpty()
        name: string

    @IsString()
    @IsNotEmpty()
        courseId: TCourseId
}

export class LessonUpdateDTO extends LessonCreateDTO {
    @IsString()
    @IsNotEmpty()
        _id: TLessonId
}

export class PageCreateDTO {
    @IsString()
    @IsNotEmpty()
        name: string

    @IsString()
    @IsNotEmpty()
        lessonId: TLessonId

    structure: {
        blocks: TEditorBlock[]
    }
}
