const { Client } = require('discord.js')
const fs = require('fs')
const path = require('path')

const globalElements = require('./globalElements')
const DatabaseHandler = require('../handlers/DatabaseHandler')

const loggerGen = require('../shared/logger')
const logger = loggerGen('BotClient')

/**
 * Main Bot Client
 * @extends {Client} discord.js Client
 */
class BotClient extends Client {
  constructor () {
    super()

    logger.log('initializing bot instance')

    // Load Global Properties and Functions
    logger.log('loading Global Properties and Functions')
    globalElements(loggerGen('globalElements'))

    let config

    // Load token seperately
    logger.verbose('Loading bot TOKEN')
    let token = ''
    if (process.env.flashbotToken) token = process.env.flashbotToken
    else if (fs.existsSync(path.join(path.resolve(), 'token.json'))) token = require(path.join(path.resolve(), 'token.json')).token

    if (typeof token !== 'string' || token.length < 1) logger.fatal('Invalid bot TOKEN provided.')

    // Load Config
    // TODO: read config file, and use only what it needs.
    logger.log('loading configuration')
    if (fs.existsSync(path.join(path.resolve(), 'config.js'))) config = require(path.join(path.resolve(), 'config.js'))
    else {
      config = {
        owner: [],
        prefix: '//',
        extensions: {}
      }
    }

    config.token = token
    config.prefix = process.env.flashBotPrefix || config.prefix

    // Owner
    // TODO loglevel = verbose
    logger.verbose('checking bot owners')
    if (!Array.isArray(config.owner) || config.owner.length < 1) {
      logger.warn('No owner in the environment variable or config file; You cannot use owner-only commands.')
      config.owner = []
    }

    // Prefix
    if (typeof config.prefix !== 'string') logger.fatal("Invalid type for 'config.prefix'. Accepts String.")
    if (config.prefix.length < 1) logger.warn('Command prefix configuration not found. You can only enter commands by pinging the bot.')

    // Debug mode
    if (config.debug) {
      this.debugMode = logger.debugMode = true
      logger.debug('Debug mode enabled.')
    } else this.debugMode = logger.debugMode = false

    // Extensions
    if (config.extensions != null && typeof config.extensions !== 'object') {
      logger.warn('Invalid type for extension configuration. Accepts object.')
      config.extensions = {}
    } else if (config.extensions == null) config.extensions = {}

    this.config = config
    logger.log('loaded configuration')
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
    logger.log('logging in to Discord...')
    this.login(this.config.token)
  }

  async setupDatabase () {
    const _logger = logger.extend('setupDatabase')
    if (typeof this.config.db !== 'object') return _logger.warn('Database type not found: Database related features will be disabled.')

    this.db = await new DatabaseHandler(this, this.config.db.type, this.config.db.connection)
    await this.db.test()
    _logger.log('Database Handler has been set up')
  }

  registerLocaleHandler (localeHandler) {
    this.locale = localeHandler
    logger.verbose('Locale Handler registered')
  }

  registerCommandHandler (cmdHandler) {
    this.commands = cmdHandler
    logger.verbose('Command Handler registered')
  }

  registerExtensionHandler (extHandler) {
    this.extensions = extHandler
    logger.verbose('Extension Handler registered to Bot Client')
  }

  /**
   * Register the event to Bot Client.
   * @arg {string} type type of event
   * @arg {function} fn function to call
   * @arg {...any} args arguments to pass to the function
   */
  registerEvent (type, fn, ...args) {
    this.on(type, (...eventArgs) => fn(this, ...eventArgs, ...args))
    logger.verbose(`${type} event registered to Bot Client`)
  }
}

module.exports = BotClient
