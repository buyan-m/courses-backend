import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsString } from 'class-validator'
import { TUserId } from '../types/entities.types'

export class IssueModelClass {
    _id: string

    @ApiProperty()
    @IsString()
        user: TUserId

    @ApiProperty()
    @IsString()
        writtenEmail: string

    @ApiProperty()
    @IsString()
        gotEmail: string

    @ApiProperty()
    @IsString()
        issueText: string

    @ApiProperty()
    @IsString()
        url: string

    @ApiProperty()
    @IsString()
        cdate: string

    @ApiProperty()
    @IsBoolean()
        checked: boolean

    @ApiProperty()
    @IsBoolean()
        emailIsCorrect: boolean
}

export class IssueReport {
    @ApiProperty()
    @IsString()
        email: string

    @ApiProperty()
    @IsString()
        actualEmail: string

    @ApiProperty()
    @IsString()
        report: string

    @ApiProperty()
    @IsString()
        url: string
}

export class IssueReportDTO extends IssueReport {
    @ApiProperty()
    @IsString()
        userId:  string
}
