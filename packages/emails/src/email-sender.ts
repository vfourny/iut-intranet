import { getServerEnv } from '@iut-intranet/helpers/env'
import { Resend } from 'resend'

import { HandlebarEmailEngine } from '@/handlebars-email-engine'
import type {
  EmailTemplate,
  EmailTemplatePayload,
  SendEmailOptions,
} from '@/types'

const { EMAIL_FROM, RESEND_API_KEY } = getServerEnv(
  'EMAIL_FROM',
  'RESEND_API_KEY',
)

const resend = new Resend(RESEND_API_KEY)
const handlebarEmailEngine = new HandlebarEmailEngine()
const defaultFrom = EMAIL_FROM

export async function sendEmail<T extends EmailTemplate>(
  template: T,
  payload: EmailTemplatePayload[T],
  options: SendEmailOptions,
) {
  const { lang, replyTo, subject, to } = options
  const html = handlebarEmailEngine.renderTemplate(template, payload, lang)

  try {
    const { data: result, error } = await resend.emails.send({
      from: defaultFrom,
      html,
      replyTo,
      subject,
      to,
    })

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return result
  } catch (error) {
    throw new Error(`Failed to send email to "${to.join(', ')}": ${error}`)
  }
}
