# slack-notion-preview

## Description

A Slack App that expands private Notion links when they are posted to Slack.

![Usage](docs/usage.png)

## Features

- Notion article title expansion (properties not yet supported)
- Notion article content expansion (supports normal text, bulleted lists, and numbered lists only)

## Installation

1. Create Notion API Integrations with Internal integrations and obtain a token
2. Create Slack App
3. Deploy slack-notion-preview
4. register the URL of step 3 to the app created in step 2
5. Invite Slack App bot users to the channel
6. Allow Integration on the pages you want to unfurl

### Create Integrations for Notion API with Internal integrations and get a token.

Refer to [Getting Started](https://developers.notion.com/docs/getting-started) to obtain an access token.

### 2. Creating Slack App

1. create an app from Create New App at https://api.slack.com/apps
   Open OAuth & Permissions in the left menu and add link:write in Scopes.
   Open Event Subscriptions from the left menu.
   - Expand App unfurl domains, under Add Domain, enter `www.notion.so`, and Save Changes.
     Open Install App from the left menu, Install App to Workspace -> Allow
     Note the OAuth Access Token when it appears (`SLACK_TOKEN`)
     Open Basic Information and note Signing Secret in App Credentials (`SLACK_SIGNING_SECRET`)

Leave the Slack App admin screen open, as you will return to it later.

### Deploy slack-notion-preview

Since it is a web application written in Node.js, it can easily be run anywhere, but using Heroku or Google App Engine is probably easier. The following environment variables are required for operation.

- `NOTION_TOKEN`: Notion's access token obtained in step 1
- `SLACK_TOKEN`: Slack App token obtained in steps 2-5
- `SLACK_SIGNING_SECRET`: Request signature verification secret obtained in step 2-6

#### Running on Heroku

You can deploy from the following button

[! [Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

The page will not be displayed even if you access the URL root of the deployed app, but this is just a specification, so don't worry about it.

### Register the URL of 3 to the app created in 4. 2.

- Open the left menu Event Subscriptions
- Enter `URL/slack/events` of the app deployed in 3 in Request URL (e.g. https://your-app.herokuapp.com/slack/events)
- When "Verified" is displayed, turn Enable Events On and Save Changes.

### Invite Slack App bot to the channel.

Check the Bot name from App Home on the left menu.

### Allow Integration on the page you want to deploy.

In order to access via API, Integration must be allowed on that page.  
! [Grant Integrations](docs/grant-integration.png)

Currently, it does not seem possible to allow all pages at the workspace level.  
However, if you allow it on the parent page, it will be applied to the descendant pages, so it is possible to solve this problem, although it is troublesome to allow it on each page in the sidebar.

Now you are ready to go.

## See Also

slack-notion-preview is based on [MH4GF's repository](https://github.com/MH4GF/notion-deglacer).  
In particular, most of the README is used as is. We would like to take this opportunity to thank you.
