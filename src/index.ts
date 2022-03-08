import { appEnv } from './app-env'
appEnv.init()

import { App as SlackApp, LogLevel } from '@slack/bolt'
import { LinkUnfurls } from '@slack/web-api'
import { logger } from './logger'
import { notionService } from './notion'

const slackApp = new SlackApp({
  token: appEnv.slackToken,
  signingSecret: appEnv.slackSigningSecret,
  logLevel: appEnv.isProduction ? LogLevel.ERROR : LogLevel.DEBUG,
})

// Remove &amp;, which & sometimes escaped to, perhaps due to a bug in Slack.
const sanitizeSlackLink = (url: string): string => {
  return url.replace(/amp;/g, '')
}

slackApp.event('link_shared', async ({ event, client }) => {
  let unfurls: LinkUnfurls = {}

  for (const link of event.links) {
    logger.debug(`handling ${link.url}`)
    if (!notionService.isNotionDomain(link.domain)) continue

    const url = new URL(sanitizeSlackLink(link.url))
    const notionPageId = notionService.getPageIdFromUrl(url)

    if (notionPageId == null) {
      logger.error(`PageId not found in ${url}`)
      continue
    }
    const [title, text] = await Promise.all([
      notionService.getPageTitle(notionPageId),
      notionService.getPageBody(notionPageId),
    ])
    // Note that the key of the unfurl must be the same as the URL shared on slack.
    unfurls[link.url] = {
      title,
      text,
      title_link: link.url,
    }
  }
  await client.chat.unfurl({
    ts: event.message_ts,
    channel: event.channel,
    unfurls,
  })
})

const main = async () => {
  await slackApp.start({ port: appEnv.port, path: '/' })
  console.log(`⚡️ Bolt app is listening ${appEnv.port}`)
}

main()
