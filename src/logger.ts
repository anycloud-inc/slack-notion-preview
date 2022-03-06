import { appEnv } from './app-env'

export const logger = {
  debug(...data: any[]) {
    if (appEnv.isProduction) return
    console.log('️⚪️', ...data)
  },
  log(...data: any[]) {
    console.log('🔵', ...data)
  },
  error(...data: any[]) {
    console.log('🔴', ...data)
  },
}
