import { createParamDecorator } from '@nestjs/common'

export const Token = createParamDecorator(
    function extractToken(data, ctx) {
        const request = ctx.switchToHttp().getRequest()
        return request.cookies.token
    }
)
