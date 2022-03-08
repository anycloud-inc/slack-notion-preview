import { App as SlackApp, LogLevel } from '@slack/bolt'
import { ChatUnfurlArguments } from '@slack/web-api'
import { appEnv } from './app-env'

appEnv.init()

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
  const notionUnfurls = event.links
    .filter(x => isNotionDomain(x.domain))
    .reduce((prev, current) => {
      // TODO: notion API にアクセス
      prev[current.url] = {
        title: 'Title Title',
        text: 'Text Text',
        title_link: current.url,
      }
      return prev
    }, {} as ChatUnfurlArguments['unfurls'])
  client.chat.unfurl({
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
