import { appEnv } from './app-env'
appEnv.init()

import { App as SlackApp, LogLevel } from '@slack/bolt'
import { ChatUnfurlArguments } from '@slack/web-api'
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
  for (const link of event.links) {
    if (!isNotionDomain(link.domain)) continue

    const url = new URL(link.url)
    const notionPageId = notionUtil.getPageIdFromUrl(url)

    if (notionPageId == null) {
      logger.error(`PageId not found in ${url}`)
      continue
    }

    const page = await notionClient.pages.retrieve({ page_id: notionPageId })
    if (!('properties' in page)) {
      logger.error(`properties not found in ${page}`)
      continue
    }
    const blocks = await notionClient.blocks.children.list({
      block_id: notionPageId,
    })

    const notionPages = [{ page, blocks }]
    logger.debug('notionPages', notionPages)

    const notionUnfurls = notionPages.reduce((prev, { page, blocks }) => {
      let title = ''
      for (const property of Object.values(page.properties)) {
        if (property.type !== 'title') continue
        title = property.title.map(x => x.plain_text).join('')
      }

      let text = ''
      for (const block of blocks.results) {
        if (!('type' in block)) continue
        switch (block.type) {
          case 'paragraph':
            text += block.paragraph.rich_text.map(x => x.plain_text).join('')
            text += '\n'
            break

          case 'bulleted_list_item':
            text += '・'
            text += block.bulleted_list_item.rich_text
              .map(x => x.plain_text)
              .join('')
            text += '\n'
            break

          case 'numbered_list_item':
            // TODO: 連番を振る
            text += '・'
            text += block.numbered_list_item.rich_text
              .map(x => x.plain_text)
              .join('')
            text += '\n'
            break

          default:
            logger.debug(`Unsupported type: ${block.type}`)
            break
        }
      }

      // unfurlのキーはslackでシェアされたURLと同じ必要あり.
      // page.urlだと元のURLと変化している場合があるので注意.
      prev[link.url] = {
        title,
        text,
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
  }
})

const main = async () => {
  await slackApp.start({ port: appEnv.apiPort, path: '/' })
  console.log(`⚡️ Bolt app is listening ${appEnv.apiPort}`)
}

main()
