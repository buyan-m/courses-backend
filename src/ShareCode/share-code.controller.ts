import { Controller, Get } from '@nestjs/common'
import { ShareCodeService } from './share-code.service'
import { AuthService } from '../Auth/auth.service'
import { Token } from '../utils/extractToken'
import { ApiResponse } from '@nestjs/swagger'
import { ShareCodeDTO } from './share-code.classes'

@Controller('share-code')
export class ShareCodeController {
    constructor(
        private readonly shareCodeService: ShareCodeService,
        private readonly authService: AuthService,
    ) {}

    @Get('')
    @ApiResponse({ type: ShareCodeDTO })
    async getOwnCode(@Token() token: string):Promise<ShareCodeDTO> {
        const userId = await this.authService.getUserId(token)
        return this.shareCodeService.getOwnCode(userId)
    }
}
