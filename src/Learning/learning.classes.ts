import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

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
