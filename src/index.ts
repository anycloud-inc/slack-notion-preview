import { appEnv } from './app-env'
appEnv.init()

import { App as SlackApp, LogLevel } from '@slack/bolt'
import { ChatUnfurlArguments } from '@slack/web-api'
import { nonNullable } from './utils'
import { logger } from './logger'
import { notionClient, notionUtil } from './notion'

const slackApp = new SlackApp({
  token: appEnv.slackToken,
  signingSecret: appEnv.slackSigningSecret,
  logLevel: LogLevel.DEBUG,
})

const isNotionDomain = (domain: string): boolean => {
  return domain.match(/(www\.)?notion.so/) != null
}

slackApp.event('link_shared', async ({ event, client }) => {
  console.log(event)
  const promises = event.links
    .filter(link => isNotionDomain(link.domain))
    .map(async link => {
      const url = new URL(link.url)
      const notionPageId = notionUtil.getPageIdFromUrl(url)

      if (notionPageId == null) {
        logger.debug(`PageId not found in ${url}`)
        return null
      }

      const page = await notionClient.pages.retrieve({ page_id: notionPageId })
      if (!('properties' in page)) {
        logger.debug(`properties not found in ${page}`)
        return null
      }
      const blocks = await notionClient.blocks.children.list({
        block_id: notionPageId,
      })
      return { page, blocks }
    })

  const notionPages = (await Promise.all(promises)).filter(nonNullable)

  logger.debug('notionPages', notionPages)

  const notionUnfurls = notionPages.reduce((prev, { page, blocks }) => {
    let title = ''
    for (const property of Object.values(page.properties)) {
      if (property.type !== 'title') continue
      title = property.title.map(x => x.plain_text).join('')
    }

    prev[page.url] = {
      title: title,
      text: 'Text Text',
      title_link: page.url,
    }
    return prev
  }, {} as ChatUnfurlArguments['unfurls'])

  logger.debug('notionUnfurls', notionUnfurls)

  await client.chat.unfurl({
    ts: event.message_ts,
    channel: event.channel,
    unfurls: notionUnfurls,
  })
})

const main = async () => {
  await slackApp.start({ port: appEnv.apiPort, path: '/' })
  console.log(`⚡️ Bolt app is listening ${appEnv.apiPort}`)
}

main()
