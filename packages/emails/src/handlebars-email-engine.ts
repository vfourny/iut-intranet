import fs from 'node:fs'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import Handlebars from 'handlebars'

import type { SupportedLocale } from '@/locales'
import { locales } from '@/locales'
import type { EmailTemplate, EmailTemplatePayload } from '@/types'

export class HandlebarEmailEngine {
  private readonly baseDir: string
  private readonly handlebars: typeof Handlebars

  constructor() {
    this.baseDir = dirname(fileURLToPath(import.meta.url))
    this.handlebars = Handlebars.create()
    this.registerPartials()
  }

  public renderTemplate<T extends EmailTemplate>(
    templateName: T,
    payload: EmailTemplatePayload[T],
    lang: SupportedLocale = 'fr',
  ): string {
    const templatePath = path.join(
      this.baseDir,
      'templates',
      `${templateName}.hbs`,
    )
    const templateSource = fs.readFileSync(templatePath, 'utf-8')

    const template = this.handlebars.compile(templateSource)
    return template({ ...payload, t: locales[lang][templateName] })
  }

  private registerPartials(): void {
    const partialsDir = path.join(this.baseDir, 'partials')

    try {
      fs.readdirSync(partialsDir)
        .filter((file) => file.endsWith('.hbs'))
        .forEach((file) => {
          const partialPath = path.join(partialsDir, file)
          const partialName = path.parse(file).name
          const partialContent = fs.readFileSync(partialPath, 'utf-8')

          this.handlebars.registerPartial(partialName, partialContent)
        })
    } catch (error) {
      throw new Error(
        `Failed to register partials from "${partialsDir}": ${error}`,
      )
    }
  }
}
