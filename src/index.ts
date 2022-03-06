import * as express from 'express'
import * as morgan from 'morgan'
import { appEnv } from './app-env'
import { logger } from './logger'

appEnv.init()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev'))

process.on('unhandledRejection', logger.error)

// const slackRequestValidator = req => {
// request_body = req.body()
// req.
// }

// const server = http.createServer((req, res) => {
//   // TODO: slack のリクエスト検証
//   // TODO: challengeリクエストのハンドリング
//   // TODO: unfurlリクエストのハンドリング

//   console.log(appEnv.notionToken)
//   res.writeHead(200, {
//     'Content-Type': 'application/json',
//   })

//   const responseMessage = '<h1>Hello World</h1>'
//   res.end(responseMessage)
// })

app.get('/', (req, res) => {
  logger.log()

  const timestamp = req.headers['X-Slack-Request-Timestamp']
  const sigBase = 'v0:' + timestamp + ':' + req.body

  res.json({ success: true })
})

app.listen(appEnv.apiPort, () =>
  logger.debug(`Server listening on port ${appEnv.apiPort}...`)
)
