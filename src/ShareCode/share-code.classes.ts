import { TUserId } from '../types/entities.types'
import { ApiProperty } from '@nestjs/swagger'

export class ShareCodeDTO {
    @ApiProperty()
        userId: TUserId

    @ApiProperty()
        _id: string
}

export class ShareCode extends ShareCodeDTO{

    validTill: number

    status: ShareCodeStatus
}

export enum ShareCodeStatus {
    'actual' = 'actual',
    'outdated' = 'outdated'
}
