import type { SupportedLocale } from '@/locales'

export interface ResetPasswordEmailPayload {
  expiresIn: number
  resetPasswordUrl: string
  user: { firstName: string; lastName: string }
}

export const EmailTemplate = {
  ResetPassword: 'reset-password',
} as const

export type EmailTemplate = (typeof EmailTemplate)[keyof typeof EmailTemplate]

export interface EmailTemplatePayload {
  [EmailTemplate.ResetPassword]: ResetPasswordEmailPayload
}

export type { SupportedLocale }

export interface SendEmailOptions {
  lang?: SupportedLocale
  replyTo?: string
  subject: string
  to: string[]
}
