import { IsNotEmpty, IsString } from 'class-validator'
import { EditorBlockType, TEditorBlock } from './editor-content.types'
import { ApiProperty } from '@nestjs/swagger'
import { TLessonId } from './entities.types'

export class CourseDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
        name: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
        description: string
}

export class EditorPageBlock {
    @IsString()
    @ApiProperty()
        id: string

    @IsString()
    @ApiProperty()
        type: EditorBlockType

    @ApiProperty()
        data: TEditorBlock['data']
}

class EditorPageStructure {
    @IsString()
    @ApiProperty()
        version: string

    @ApiProperty({ isArray: true, type: EditorPageBlock })
        blocks: EditorPageBlock[]
}

export class PageCreateDTO {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
        name: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
        lessonId: TLessonId

    @ApiProperty()
        structure: EditorPageStructure
}
