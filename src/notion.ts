import { Client } from '@notionhq/client'
import { GetPageResponse } from '@notionhq/client/build/src/api-endpoints'
import { appEnv } from './app-env'
import { logger } from './logger'
import { getLastElement } from './utils'

export const notionClient = new Client({
  auth: appEnv.notionToken,
})

export const notionService = {
  async getPageTitle(pageId: string): Promise<string> {
    const page = await notionClient.pages.retrieve({ page_id: pageId })
    // Descriminating union
    if (!('properties' in page)) {
      logger.error(`properties not found in ${page}`)
      return ''
    }
    let title = ''
    for (const property of Object.values(page.properties)) {
      // Descriminating union
      if (property.type !== 'title') continue
      title = property.title.map(x => x.plain_text).join('')
    }
    return title
  },

  async getPageBody(pageId: string): Promise<string> {
    const blocks = await notionClient.blocks.children.list({
      block_id: pageId,
    })

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
    return text
  },

  isNotionDomain: (domain: string): boolean => {
    return domain.match(/(www\.)?notion.so/) != null
  },

  getPageIdFromUrl: (url: URL): string | undefined => {
    // モーダル表示の場合はqueryのpに入っている
    // https://www.notion.so/example/my-title-571bb99b29e040eb8a46c2f9b7d138af?p=5daca1bba9ce4ed0bf7a5d348ac9a81d
    const queryId = url.searchParams.get('p')
    if (queryId != null) {
      return queryId
    }

    // ページ表示の場合はpathを-で区切った末端部分
    // https://www.notion.so/example/my-title-571bb99b29e040eb8a46c2f9b7d138af
    const pathLast = getLastElement(url.pathname.split('/'))
    return getLastElement(pathLast?.split('-') ?? [])
  },
}
