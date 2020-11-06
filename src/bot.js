/**
 * @name bot.js
 * @description Main Bot Script
 */

/* eslint-disable no-unused-vars */
const VERSION = 'v1.0-dev'
const BUILD_DATE = '2020/11/6'
/* eslint-enable no-unused-vars */

// import necessary modules
const path = require('path')

const BotClient = require('./structures/BotClient')
const CommandHandler = require('./handlers/CommandHandler')
const LocaleHandler = require('./handlers/LocaleHandler')

const onReadyEvent = require('./events/onReady')
const onMessageEvent = require('./events/onMessage')

/**
 * Main Client
 * @type {BotClient}
 */
const client = new BotClient()
client.VERSION = VERSION
client.BUILD_DATE = BUILD_DATE

/**
 * Database
 */
client.setupDatabase()

// Setup Locale (i18n)
client.registerLocaleHandler(new LocaleHandler(client))

// event
client.registerEvent('ready', onReadyEvent)
client.registerEvent('message', onMessageEvent)

// Login to Discord
client.start()

client.registerCommandHandler(new CommandHandler(client))
client.commands.registerGroups([
  'activation', // Activating and Deactivating Server
  'dev', // For Development
  'info', // Various Informations
  'memo', // memo
  'misc', // Other things
  'util', // Utilities
  'settings', // Settings
  'game' // Games
])
client.commands.registerBaseCommands(path.join(__dirname, 'commands'))

// web server (Heroku web dyno placeholder)
const express = require('express')
const app = express()
/**
 * web server port
 * @type {number}
 */
const PORT = process.env.PORT || 5000

app.use(express.static('public'))
app.listen(PORT, () => client.logger.log('BOT MAIN', `Web server on port ${PORT}`))
