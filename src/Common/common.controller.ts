import { randomBytes } from 'node:crypto'
import { writeFile, createReadStream } from 'node:fs'
import { resolve } from 'node:path'
import type { NestInterceptor } from '@nestjs/common'
import {
    Controller,
    Post,
    Get,
    Param,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    StreamableFile,
    Put,
    Body
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { promisify } from 'util'
import { throwForbidden } from '../utils/errors'
import { DEV_MODE } from '../constants/dev-mode'
import { STRICT_MODE } from '../constants/strict-mode'
import { Token } from '../utils/extractToken'
import { IssueReport } from './common.classes'
import { AuthService } from '../Auth/auth.service'
import { Throttle } from '@nestjs/throttler'
import { CommonService } from './common.service'
import { OkResponse } from 'src/utils/emptyResponse'

const asyncWriteFile = promisify(writeFile)
function generateImageName() {
    return randomBytes(15).toString('hex') + '.jpg'
}

@Controller()
export class CommonController {

    constructor(
        private readonly authService: AuthService,
        private readonly commonService: CommonService
    ) {}

    @Post('image-upload')
    @UseInterceptors(FileInterceptor('image') as unknown as NestInterceptor)
    async imageUpload(@UploadedFile(
        new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 500000 }),
                new FileTypeValidator({ fileType: 'image/jpeg' })
            ]
        }),
    ) file: Express.Multer.File) {
        const EditorjsFormat = {
            success: 1,
            file: {
                url: ''
                // ... and any additional fields you want to store, such as width, height, color, extension, etc
            }
        }
        const name = generateImageName()
        await asyncWriteFile(resolve(__dirname, `../../uploads/${name}`), file.buffer)
        // save image relation to page
        EditorjsFormat.file.url = `/api/uploads/${name}`

        return EditorjsFormat
    }

    @Get('uploads/:filename')
    getImage(@Param('filename') filename: string) {
        const file = createReadStream(resolve(__dirname, `../../uploads/${filename}`))
        return new StreamableFile(file)
    }

    @Get('health-check')
    healthCheck() {
        return ('')
    }

    @Get('api-schema')
    getSchema() {
        if (DEV_MODE) {
            const file = createReadStream(resolve( './types.d.ts'))
            return new StreamableFile(file)
        }
        throwForbidden()
    }

    @Throttle(1, 120)
    @Put('issue-report')
    async issueReport(@Body() body: IssueReport, @Token() token: string) {
        if (!token && STRICT_MODE) {
            throwForbidden()
        }
        const userId = await this.authService.getUserId(token)
        if (!userId && STRICT_MODE) {
            throwForbidden()
        }

        await this.commonService.createIssue({ ...body, userId: userId.toString() })
        return new OkResponse()
    }
}
