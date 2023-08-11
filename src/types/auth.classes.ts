import {
    IsEmail, IsNotEmpty, IsString, MinLength
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { TUserId } from './entities.types'
import { Roles } from '../constants/general-roles'

const PASSWORD_MIN_LENGTH = 8

export class AuthDto {
    @IsEmail()
    @ApiProperty()
        email: string

    @IsNotEmpty()
    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH)
    @ApiProperty()
        password: string

}

export class RegisterDto {
    @IsEmail()
    @ApiProperty()
        email: string

    @IsNotEmpty()
    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH)
    @ApiProperty()
        password: string

    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @ApiProperty()
        name: string

}

export class AuthCheckResponse {
    @ApiProperty()
        userId: TUserId

    @ApiProperty({
        enum: [ Object.values(Roles) ], isArray: true, type: String
    })
        roles: Roles[]
}

export class ConfirmEmailDTO {
    @ApiProperty()
    @IsString()
        email: string

    @ApiProperty()
    @IsString()
        code: string
}

export class RequestConfirmEmailDTO {
    @ApiProperty()
    @IsString()
        email: string
}
