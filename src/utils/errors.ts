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

export function throwUnprocessable(details: string) {
    throw new HttpException(`Error: Unprocessable Content: ${details}`, HttpStatus.UNPROCESSABLE_ENTITY)
}

export function throwInternalError() {
    throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR)
}
