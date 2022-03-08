import { appEnv } from './app-env'
appEnv.init()

import { ChatUnfurlArguments } from '@slack/web-api'
import { logger } from './logger'
import { notionClient, notionUtil } from './notion'

// const notion

const main = async () => {
  const url = new URL(
    'https://www.notion.so/anycloud/2020-12-03-SNS-2eeaeba7d2a243e195f33447ab62fb1d'
  )
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
  // return { page, blocks }

  const notionPages = [{ page, blocks }]

  logger.debug('notionPages')
  logger.debug(notionPages)

  const notionUnfurls = notionPages.reduce((prev, { page, blocks }) => {
    let title = ''
    for (const property of Object.values(page.properties)) {
      if (property.type !== 'title') continue
      title = property.title.map(x => x.plain_text).join('')
    }

    prev[page.url] = {
      title: title,
      title_link: page.url,
    }
    return prev
  }, {} as ChatUnfurlArguments['unfurls'])
  logger.debug('notionUnfurls')
  logger.debug(notionUnfurls)
}

main()
