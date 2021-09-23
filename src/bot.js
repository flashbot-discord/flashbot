/**
 * @name bot.js
 * @description Main Bot Script
 */

/* eslint-disable no-unused-vars */
const VERSION = 'v2.0-alpha.1-dev'
const BUILD_DATE = '2021/9/14'
/* eslint-enable no-unused-vars */

// setup final layer of crash protection from errors
process.on('uncaughtException', (e) => console.error(e))
process.on('unhandledRejection', (e) => console.error(e))

// Setup logger first
const logger = require('./shared/logger')

const log = logger('main')
log.log(`
=== FlashBot Startup ===

Version: ${VERSION}
Build Date: ${BUILD_DATE}\n`)

// import necessary modules
const path = require('path')

const BotClient = require('./structures/BotClient')
const CommandHandler = require('./handlers/CommandHandler')
const LocaleHandler = require('./handlers/LocaleHandler')
const ExtensionHandler = require('./handlers/ExtensionHandler')

const onReadyEvent = require('./events/onReady')
const onMessageEvent = require('./events/onMessageCreate')

/**
 * Main Client
 * @type {BotClient}
 */
log.log('creating bot instance')
const client = new BotClient()
client.VERSION = VERSION
client.BUILD_DATE = BUILD_DATE

/**
 * Database
 */
log.log('setting up database')
client.setupDatabase()

// Setup Locale (i18n)
log.log('creating and registering locale handler')
client.registerLocaleHandler(new LocaleHandler(client))

// Extension Handler
log.log('creating and registering extension handler')
client.registerExtensionHandler(new ExtensionHandler(client))

// event
client.registerEvent('ready', onReadyEvent)
client.registerEvent('messageCreate', onMessageEvent)

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
app.listen(PORT, () => log.log(`Web server on port ${PORT}`))
