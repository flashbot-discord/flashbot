const { Client } = require('discord.js')
const fs = require('fs')
const path = require('path').resolve()

const Logger = require('./Logger')
const DatabaseHandler = require('./DatabaseHandler')

/**
 * Main Bot Client
 * @extends {Client} discord.js Client
 */
class BotClient extends Client {
  constructor () {
    super()

    // Setup Logger
    const logger = new Logger()
    this.logger = logger

    logger.log('BotClient', 'FlashBot Startup')

    let config

    // Load token seperately
    let token = ''
    if(process.env.flashbotToken) token = process.env.flashbotToken
    else if (fs.existsSync(path + '/token.json')) token = require(path + '/token.json').token
    if (typeof token !== 'string' || token.length < 1) logger.fatal('BotClient', 'Invalid bot TOKEN provided.')
    logger.log('BotClient', 'Loaded bot TOKEN')

    // Load Config
    if (fs.existsSync(path + '/config.json')) config = require(path + '/config.json')
    else config = { owner: [], prefix: '//' }

    config.token = token
    config.prefix = process.env.flashBotPrefix || config.prefix

    if (!Array.isArray(config.owner) || config.owner.length < 1) {
      logger.warn('BotClient', 'No owner in the environment variable or config file; You cannot use owner-only commands.')
      config.owner = []
    }

    if (typeof config.prefix !== 'string') logger.fatal('BotClient', "Invalid type for 'config.prefix'. Accepts String.")
    if (config.prefix.length < 1) logger.warn('BotClient', 'Command prefix configuration not found. You can only enter commands by pinging the bot.')

    this.config = config
    logger.log('BotClient', 'Loaded bot configuration')
  }

  start () {
    this.logger.log('BotClient.start', 'Logging in to Discord...')
    this.login(this.config.token)
  }

  async setupDatabase () {
    this.db = new DatabaseHandler(this, this.config.db.type, this.config.db.connection)
    await this.db.test()
    this.logger.debug('BotClient.setupDatabase', 'Database Handler has been set up')
  }

  registerLocaleHandler (localeHandler) {
    this.locale = localeHandler
    this.logger.debug('BotClient.registerLocaleHandler', 'Locale Handler registered to Bot Client')
  }

  registerCommandHandler (cmdHandler) {
    this.commands = cmdHandler
    this.logger.debug('BotClient.registerCommandHandler', 'Command Handler registered to Bot Client')
  }

  /**
   * Register the event to Bot Client.
   * @arg {string} type type of event
   * @arg {function} fn function to call
   * @arg {...any} args arguments to pass to the function
   */
  registerEvent (type, fn, ...args) {
    this.on(type, (...eventArgs) => fn(this, ...eventArgs, ...args))
    this.logger.debug('BotClient.registerEvent', "'" + type + "' event registered to Bot Client")
  }
}

module.exports = BotClient
