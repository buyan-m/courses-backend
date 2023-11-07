import { IsEmail } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { TPaginated } from '../types/entities.types'
import { Storage } from '../Storage/storage.types'
import { UserInfo } from './auth.classes'

export class EmailApproveDto {
    @IsEmail()
    @ApiProperty()
        email: string
}

export type TAdminUserData = {
    userInfo: UserInfo,
    latestUploads: TPaginated<Storage>
}
