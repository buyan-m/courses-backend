import { randomBytes } from 'node:crypto'
import { resolve } from 'node:path'
import type { NestInterceptor } from '@nestjs/common'
import {
    Controller,
    Post,
    Get,
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
import { throwForbidden } from '../utils/errors'
import { DEV_MODE } from '../constants/dev-mode'
import { STRICT_MODE } from '../constants/strict-mode'
import { Token } from '../utils/extractToken'
import { IssueReport } from './common.classes'
import { AuthService } from '../Auth/auth.service'
import { Throttle } from '@nestjs/throttler'
import { createReadStream } from 'node:fs'
import { CommonService } from './common.service'
import { OkResponse } from '../utils/emptyResponse'
import { StorageService } from '../Storage/storage.service'
import { RoleService } from '../Role/role.service'
import { Roles } from '../constants/general-roles'

@Controller()
export class CommonController {

    constructor(
        private readonly authService: AuthService,
        private readonly roleService: RoleService,
        private readonly commonService: CommonService,
        private readonly storageService: StorageService
    ) {}

    @Post('image-upload')
    @UseInterceptors(FileInterceptor('image') as unknown as NestInterceptor)
    async imageUpload(
    @UploadedFile(
        new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 500000 }),
                new FileTypeValidator({ fileType: 'image/jpeg' })
            ]
        }),
    ) file: Express.Multer.File,
        @Token() token: string
    ) {
        const userId = await this.authService.checkAuth(token)
        const roles = await this.roleService.getUserRoles(userId)

        if (roles.some(({ role }) => role === Roles.guest || role === Roles.banned)) {
            throwForbidden()
        }

        const EditorjsFormat = {
            success: 1,
            file: {
                url: ''
                // ... and any additional fields you want to store, such as width, height, color, extension, etc
            }
        }
        const url = await this.storageService.uploadImage({ file: file, userId })
        // save image relation to page
        EditorjsFormat.file.url = url

        return EditorjsFormat
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
