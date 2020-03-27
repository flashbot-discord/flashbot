const { Client } = require('discord.js')
const fs = require('fs')
const i18n = require('i18n')
const path = require('path').resolve()

const Logger = require('./Logger')

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

    // Load token seperately
    let token = ''
    if (fs.existsSync(path + '/token.json')) token = require(path + '/token.json').token

    // Load Config
    let config
    if (fs.existsSync(path + '/config.json')) config = require(path + '/config.json')
    else config = { owner: [], prefix: '//' }

    config.token = process.env.flashbotToken || token
    config.prefix = process.env.flashBotPrefix || config.prefix
    this.config = config

    if (typeof config.token !== 'string' || config.token.length < 1) logger.fatal('BotClient', 'Invalid bot TOKEN provided.')

    if (config.owner.length < 1) logger.warn('BotClient', 'No owner in the environment variable or config file; You cannot use owner-only commands.')

    if (typeof config.prefix !== 'string') logger.fatal('BotClient', "Invalid type for 'config.prefix'. Accepts String.")
    if (config.prefix.length < 1) logger.warn('BotClient', 'Command prefix configuration not found. You can only enter commands by pinging the bot.')
  }

  start () {
    this.login(this.config.token)
  }

  initLocale () {
    i18n.configure({
      directory: './locale',
      objectNotation: true,
      syncFiles: true,
      autoReload: true,
      logDebugFn: (msg) => this.logger.debug('i18n', msg),
      logWarnFn: (msg) => this.logger.warn('i18n', msg),
      logErrorFn: (msg) => this.logger.error('i18n', msg)
    })

    this.locale = i18n
    this.locale.t = (phrase, locale, ...args) => i18n.__({ phrase, locale }, ...args)
  }

  registerCommand () {

  }

  /**
   * Register the event to Bot Client.
   * @arg {string} type type of event
   * @arg {function} fn function to call
   * @arg {...any} args arguments to pass to the function
   */
  registerEvent (type, fn, ...args) {
    this.on(type, (...eventArgs) => fn(this, ...eventArgs, ...args))
  }
}

module.exports = BotClient
