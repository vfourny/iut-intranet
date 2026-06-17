import fs from 'node:fs'

import { HandlebarEmailEngine } from '@/handlebars-email-engine'
import { fr } from '@/locales'
import { EmailTemplate } from '@/types'

const engine = new HandlebarEmailEngine()

const payload = {
  expiresIn: 15 * 60,
  resetPasswordUrl: 'https://example.com/reset/token456',
  user: { firstName: 'Alice', lastName: 'Bernard' },
}

describe('HandlebarEmailEngine', () => {
  describe('registerPartials', () => {
    it('should throw when the partials directory cannot be read', () => {
      vi.spyOn(fs, 'readdirSync').mockImplementationOnce(() => {
        throw new Error('ENOENT')
      })

      expect(() => new HandlebarEmailEngine()).toThrow(
        'Failed to register partials from',
      )
    })
  })

  describe('renderTemplate — reset-password', () => {
    it('should render every payload variable in french by default', () => {
      const html = engine.renderTemplate(EmailTemplate.ResetPassword, payload)

      expect(html).toContain(payload.user.firstName)
      expect(html).toContain(payload.user.lastName)
      expect(html).toContain(payload.resetPasswordUrl)
      expect(html).toContain(String(payload.expiresIn))
      expect(html).toContain(fr['reset-password'].singleUseNotice)
      expect(html).toContain(fr['reset-password'].cta)
    })
  })
})
