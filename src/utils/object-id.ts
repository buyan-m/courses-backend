import { Types } from 'mongoose'

import { PipeTransform } from '@nestjs/common'
import { throwNotFound } from './errors'

export class ObjectIdValidationPipe implements PipeTransform {
    transform(value: string): any {
        if (!Types.ObjectId.isValid(value)) {
            throwNotFound()
        }
        return value
    }
}
