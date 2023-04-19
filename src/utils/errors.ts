import { HttpException, HttpStatus } from '@nestjs/common'

export function throwForbidden() {
    throw new HttpException('Error: Forbidden', HttpStatus.FORBIDDEN)
}

export function throwNotFound() {
    throw new HttpException('Error: Not Found', HttpStatus.NOT_FOUND)
}

export function throwUnauthorized() {
    throw new HttpException('Error: Unauthorized', HttpStatus.UNAUTHORIZED)
}
