const { Client } = require('discord.js')
const fs = require('fs')
const path = require('path')

const globalElements = require('./globalElements')
const Logger = require('./Logger')
const DatabaseHandler = require('../handlers/DatabaseHandler')

/**
 * Main Bot Client
 * @extends {Client} discord.js Client
 */
class BotClient extends Client {
  constructor () {
    super()
    const logPos = this.logPos = 'BotClient'

    // Setup Logger
    const logger = new Logger()
    this.logger = logger

    logger.log(logPos, 'FlashBot Startup')

    // Load Global Properties and Functions
    globalElements(logger)
    logger.log(logPos, 'Loaded Global Properties and Functions')

    let config

    // Load token seperately
    let token = ''
    if (process.env.flashbotToken) token = process.env.flashbotToken
    else if (fs.existsSync(path.join(path.resolve(), 'token.json'))) token = require(path.join(path.resolve(), 'token.json')).token

    if (typeof token !== 'string' || token.length < 1) logger.fatal(logPos, 'Invalid bot TOKEN provided.')
    logger.log(logPos, 'Loaded bot TOKEN')

    // Load Config
    if (fs.existsSync(path.join(path.resolve(), 'config.js'))) config = require(path.join(path.resolve(), 'config.js'))
    else config = {
      owner: [],
      prefix: '//',
      extensions: {}
    }

    config.token = token
    config.prefix = process.env.flashBotPrefix || config.prefix

    // Owner
    if (!Array.isArray(config.owner) || config.owner.length < 1) {
      logger.warn(logPos, 'No owner in the environment variable or config file; You cannot use owner-only commands.')
      config.owner = []
    }

    // Prefix
    if (typeof config.prefix !== 'string') logger.fatal(logPos, "Invalid type for 'config.prefix'. Accepts String.")
    if (config.prefix.length < 1) logger.warn(logPos, 'Command prefix configuration not found. You can only enter commands by pinging the bot.')

    // Debug mode
    if (config.debug) {
      this.debugMode = logger.debugMode = true
      logger.debug(logPos, 'Debug mode enabled.')
    } else this.debugMode = logger.debugMode = false

    // Extensions
    if (config.extensions != null && typeof config.extensions !== 'object') {
      logger.warn(logPos, 'Invalid type for extension configuration. Accepts object.')
      config.extensions = {}
    } else if (config.extensions == null) config.extensions = {}

    this.config = config
    logger.log(logPos, 'Loaded bot configuration')
  }

  get onlineMode () {
    return this._onlineMode
  }

  set onlineMode (mode) {
    this.user.setPresence({
      activity: {
        name: mode ? `${this.config.prefix}help | ${this.VERSION}` : '점검중 Under maintenance'
      },
      status: mode ? 'online' : 'dnd'
    })
    this._onlineMode = mode
  }

  start () {
    const logPos = this.logPos + '.start'

    this.logger.log(logPos, 'Logging in to Discord...')
    this.login(this.config.token)
  }

  async setupDatabase () {
    const logPos = this.logPos + '.setupDatabase'

    if (typeof this.config.db !== 'object') return this.logger.warn(logPos, 'Database type not found: Database related features will be disabled.')

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

  registerExtensionHandler (extHandler) {
    this.extensions = extHandler
    this.logger.debug(this.logPos + '.registerExtensionHandler', 'Extension Handler registered to Bot Client')
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
