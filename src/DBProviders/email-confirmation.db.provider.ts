import { Connection } from 'mongoose'
import { EmailConfirmationSchema } from '../Schemas/email-confirmation.schema'

export const emailConfirmationProvider = {
    provide: 'EMAIL_CONFIRMATION_MODEL',
    useFactory: (connection: Connection) => connection.model('EmailConfirmation', EmailConfirmationSchema),
    inject: [ 'DATABASE_CONNECTION' ]
}
