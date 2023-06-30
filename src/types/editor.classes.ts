import {
    IsBoolean, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsString, ValidateNested
} from 'class-validator'
import { EditorBlockType, TEditorBlock } from './editor-content.types'
import { ApiProperty } from '@nestjs/swagger'
import { TLessonId } from './entities.types'
import { Type } from 'class-transformer'

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

    @ApiProperty({ type: Object })
        data: TEditorBlock['data']
}

class EditorPageStructure {
    @IsNumber()
    @ApiProperty()
        time: number

    @IsString()
    @ApiProperty()
        version: string

    @ApiProperty({ isArray: true, type: EditorPageBlock })
    @ValidateNested()
    @Type(() => EditorPageBlock)
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

    @ApiProperty({ type: EditorPageStructure })
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => EditorPageStructure)
        structure: EditorPageStructure

    @ApiProperty()
    @IsBoolean()
        isAnswersVisible: boolean
}

export class PageUpdateDTO extends PageCreateDTO {
    @IsNumber()
    @ApiProperty({ type: Number })
        position: number
}
