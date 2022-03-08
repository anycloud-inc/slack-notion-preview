import { Client } from '@notionhq/client'
import { appEnv } from './app-env'
import { getLastElement } from './utils'

export const notionClient = new Client({
  auth: appEnv.notionToken,
})

export const notionUtil = {
  isNotionDomain: (domain: string): boolean => {
    return domain.match(/(www\.)?notion.so/) != null
  },

  getPageIdFromUrl: (url: URL): string | undefined => {
    // モーダル表示の場合はqueryのpに入っている
    // https://www.notion.so/example/my-title-571bb99b29e040eb8a46c2f9b7d138af?p=5daca1bba9ce4ed0bf7a5d348ac9a81d
    // ページ表示の場合はpathを-で区切った末端部分
    // https://www.notion.so/example/my-title-571bb99b29e040eb8a46c2f9b7d138af
    return url.searchParams.get('p') ?? getLastElement(url.pathname.split('-'))
  },
}
