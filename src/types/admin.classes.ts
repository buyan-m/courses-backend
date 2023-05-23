import { IsEmail } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class EmailApproveDto {
    @IsEmail()
    @ApiProperty()
        email: string
}
