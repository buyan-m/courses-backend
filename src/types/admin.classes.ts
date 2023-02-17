import { IsEmail } from 'class-validator'

export class EmailApproveDto {
    @IsEmail()
        email: string
}
