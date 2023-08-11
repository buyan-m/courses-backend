import * as sgMail from '@sendgrid/mail'
import translations from './translations'
const MAILER_SENDER = process.env.MAILER_SENDER

import emailConfirmation from './templates/email-confirmation'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

type TSendParams = {
    to: string,
    subject: string,
    text: string,
    html: string
}

type TEmailConfirmationParams = {
    to: string,
    lang?: 'ru'|'en',
    code: string
}

export class MailerService {
    #send({
        to, subject, text, html
    }: TSendParams) {
        sgMail.send({
            to,
            from: MAILER_SENDER,
            subject,
            text,
            html
        })
    }

    sendEmailConfirmation({
        to, code, lang = 'en'
    }: TEmailConfirmationParams) {
        return this.#send({
            to,
            subject: 'Email confirmation',
            text: code,
            html: emailConfirmation({
                code, email: to, texts: translations[lang]
            })
        })
    }
}
