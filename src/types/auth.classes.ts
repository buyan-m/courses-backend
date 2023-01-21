import {
    IsEmail, IsNotEmpty, IsString, MinLength
} from 'class-validator'

const PASSWORD_MIN_LENGTH = 8

export class AuthDto {
    @IsEmail()
        email: string

    @IsNotEmpty()
    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH)
        password: string

}

export class RegisterDto {
    @IsEmail()
        email: string

    @IsNotEmpty()
    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH)
        password: string

    @IsNotEmpty()
    @IsString()
    @MinLength(3)
        name: string

}
