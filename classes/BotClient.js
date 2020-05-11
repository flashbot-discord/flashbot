const { Client } = require('discord.js')
const fs = require('fs')
const path = require('path').resolve()

const globalElements = require('./globalElements')
const Logger = require('./Logger')
const DatabaseHandler = require('./DatabaseHandler')

/**
 * Main Bot Client
 * @extends {Client} discord.js Client
 */
class BotClient extends Client {
  constructor () {
    super()
    const logPos = this._logPos = 'BotClient'

    // Setup Logger
    const logger = new Logger()
    this.logger = logger

    logger.log(logPos, 'FlashBot Startup')

    // Load Global Properties and Functions
    globalElements()
    logger.log(logPos, 'Loaded Global Properties and Functions')

    // Load Global Properties and Functions
    globalElements()
    logger.log('BotClient', 'Loaded Global Properties and Functions')

    let config

    // Load token seperately
    let token = ''
    if (process.env.flashbotToken) token = process.env.flashbotToken
    else if (fs.existsSync(path + '/token.json')) token = require(path + '/token.json').token
    if (typeof token !== 'string' || token.length < 1) logger.fatal(logPos, 'Invalid bot TOKEN provided.')
    logger.log(logPos, 'Loaded bot TOKEN')

    // Load Config
    if (fs.existsSync(path + '/config.json')) config = require(path + '/config.json')
    else config = { owner: [], prefix: '//', extensions: {} }

    config.token = token
    config.prefix = process.env.flashBotPrefix || config.prefix

    if (!Array.isArray(config.owner) || config.owner.length < 1) {
      logger.warn(logPos, 'No owner in the environment variable or config file; You cannot use owner-only commands.')
      config.owner = []
    }

    if (typeof config.prefix !== 'string') logger.fatal(logPos, "Invalid type for 'config.prefix'. Accepts String.")
    if (config.prefix.length < 1) logger.warn(logPos, 'Command prefix configuration not found. You can only enter commands by pinging the bot.')

    if(typeof config.defaultLocale !== 'string') {
      logger.warn(logPos, "Invalid type for 'config.defaultLocale'. Accepts String.")
      config.defaultLocale = ''
    }
    if(config.defaultLocale.length < 1) {
      config.defaultLocale = 'ko_KR'
      logger.warn(logPos, "Default Locale configuration not found. Defaults to 'ko_KR' (한국어).")
    }

    if(config.extensions != null && typeof config.extensions !== 'object') {
      logger.warn(logPos, 'Invalid type for extension configuration. Accepts object.')
      config.extensions = {}
    } else if(config.extensions == null) config.extensions = {}

    if(typeof config.defaultLocale !== 'string') {
      logger.warn('BotClient', "Invalid type for 'config.defaultLocale'. Accepts String.")
      config.defaultLocale = ''
    }
    if(config.defaultLocale.length < 1) {
      config.defaultLocale = 'ko_KR'
      logger.warn('BotClient', "Default Locale configuration not found. Defaults to 'ko_KR' (한국어).")
    }

    if(config.extensions != null && typeof config.extensions !== 'object') {
      logger.warn('BotClient', 'Invalid type for extension configuration. Accepts object.')
      config.extensions = {}
    } else if(config.extensions == null) config.extensions = {}

    this.config = config
    logger.log(logPos, 'Loaded bot configuration')
  }

  start () {
    const logPos = this.logPos + '.start'

    this.logger.log(logPos, 'Logging in to Discord...')
    this.login(this.config.token)
  }

  async setupDatabase () {
    const logPos = this.logPos + '.setupDatabase'

    if(typeof this.config.db !== 'object') return this.logger.warn(logPos, 'Database type not found: Database related features will be disabled.')

    this.db = await new DatabaseHandler(this, this.config.db.type, this.config.db.connection)
    await this.db.test()
    this.logger.debug(logPos, 'Database Handler has been set up')
  }

  registerLocaleHandler (localeHandler) {
    this.locale = localeHandler
    this.logger.debug(this.logPos + '.registerLocaleHandler', 'Locale Handler registered to Bot Client')
  }

  registerCommandHandler (cmdHandler) {
    this.commands = cmdHandler
    this.logger.debug(this.logPos + '.registerCommandHandler', 'Command Handler registered to Bot Client')
  }

  registerExtensionHandler(extHandler) {
    this.extensions = extHandler
    this.logger.debug(this.logPos + '.registerExtensionHandler', 'Extension Handler registered to Bot Client')
  }

  registerExtensionHandler(extHandler) {
    this.extensions = extHandler
    this.logger.debug('BotClient.registerExtensionHandler', 'Extension Handler registered to Bot Client')
  }

  /**
   * Register the event to Bot Client.
   * @arg {string} type type of event
   * @arg {function} fn function to call
   * @arg {...any} args arguments to pass to the function
   */
  registerEvent (type, fn, ...args) {
    this.on(type, (...eventArgs) => fn(this, ...eventArgs, ...args))
    this.logger.debug(this.logPos + '.registerEvent', "'" + type + "' event registered to Bot Client")
  }
}

module.exports = BotClient
