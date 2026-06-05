import { sendEmail } from '@/email-sender'
import { EmailTemplate } from '@/types'

const { mockRenderTemplate, mockSend } = vi.hoisted(() => ({
  mockRenderTemplate: vi.fn(() => '<html>mocked</html>'),
  mockSend: vi.fn(),
}))

vi.mock('@iut-intranet/helpers/env', () => ({
  getServerEnv: () => ({
    EMAIL_FROM: 'noreply@example.com',
    RESEND_API_KEY: 'test-key',
  }),
}))

vi.mock('resend', () => ({
  Resend: vi.fn(function () {
    return { emails: { send: mockSend } }
  }),
}))

vi.mock('@/handlebars-email-engine', () => ({
  HandlebarEmailEngine: vi.fn(function () {
    return { renderTemplate: mockRenderTemplate }
  }),
}))

const payload = {
  expiresIn: 15 * 60,
  resetPasswordUrl: 'https://example.com/reset/token',
  user: { firstName: 'Alice', lastName: 'Bernard' },
}

const options = {
  subject: 'Réinitialisation de votre mot de passe',
  to: ['alice@example.com'],
}

describe('sendEmail', () => {
  beforeEach(() => {
    mockSend.mockReset()
    mockRenderTemplate.mockClear()
  })

  it('should forward the rendered html and recipients to resend', async () => {
    mockSend.mockResolvedValue({ data: { id: 'email-id' }, error: null })

    const result = await sendEmail(
      EmailTemplate.ResetPassword,
      payload,
      options,
    )

    expect(mockSend).toHaveBeenCalledOnce()
    const call = mockSend.mock.calls[0][0]
    expect(call.to).toEqual(options.to)
    expect(call.subject).toBe(options.subject)
    expect(call.html).toBe('<html>mocked</html>')
    expect(call.from).toBe('noreply@example.com')
    expect(result).toEqual({ id: 'email-id' })
  })

  it('should throw when resend returns an error', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: 'rate limited' },
    })

    await expect(
      sendEmail(EmailTemplate.ResetPassword, payload, options),
    ).rejects.toThrow(`Failed to send email to "${options.to.join(', ')}"`)
  })
})
