import { IsNotEmpty, IsString } from 'class-validator'

export class CourseDTO {
    @IsString()
    @IsNotEmpty()
        name: string
}
