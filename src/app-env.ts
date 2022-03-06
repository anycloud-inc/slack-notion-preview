import { AppError } from './app-error'

export const appEnv = {
  init() {
    require('dotenv').config()
  },

  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production'
  },

  get apiPort(): number {
    return Number(process.env.API_PORT) ?? 80
  },

  get notionToken(): string {
    return this._assertNonNull(process.env.NOTION_TOKEN)
  },

  get slackToken(): string {
    return this._assertNonNull(process.env.SLACK_TOKEN)
  },

  get slackSigningSecret(): string {
    return this._assertNonNull(process.env.SLACK_SIGNING_SECRET)
  },

  _assertNonNull(value: string | undefined): string {
    if (value == null || value.length === 0) {
      throw new AppError(`Required properties not found in .env`)
    }
    return value
  },
}
