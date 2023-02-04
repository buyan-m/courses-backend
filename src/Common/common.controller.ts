import { randomBytes } from 'node:crypto'
import { writeFile, createReadStream } from 'node:fs'
import { resolve } from 'node:path'
import type { NestInterceptor } from '@nestjs/common'
import {
    Controller, Post, Get, Param, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, StreamableFile
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { promisify } from 'util'

const asyncWriteFile = promisify(writeFile)
function generateImageName() {
    return randomBytes(15).toString('hex') + '.jpg'
}

@Controller()
export class CommonController {
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
}
