import { IsNotEmpty, IsString } from 'class-validator'

export class CourseAndStudentDTO {
    @IsString()
    @IsNotEmpty()
        userId: string

    @IsString()
    @IsNotEmpty()
        courseId: string
}
