const path = require('path')
const fs = require('fs')

const InternalStorageHandler = require('./InternalStorageHandler')

const logger = require('../shared/logger')('DatabaseHandler')

class DatabaseHandler {
  constructor (client, type, connection) {
    this._client = client
    this.type = type

    logger.log('Database Handler Initializing...')

    // Internal storage (game session, etc)
    this.internal = new InternalStorageHandler()

    logger.verbose('Database Type: ' + type)
    switch (type) {
      case 'mysql':
      case 'pg': {
        logger.verbose('Preparing knex Query Builder...')
        const knex = require('knex')({
          client: type,
          connection,
          asyncStackTraces: client.debugMode,
          debug: client.debugMode
        })

        this.knex = knex
        break
      }

      case 'json': {
        // JSON db uses two files:
        // guild.json, user.json
        try {
          if (!connection) connection = {}
          const folder = path.join(path.resolve(), 'data', 'jsondb')
          logger.debug('[JSON] Root stroage folder: ' + folder)
          const guildFile = 'guild.json'
          const userFile = 'user.json'
          const blacklistFile = 'blacklist.json'

          logger.verbose('[JSON] Loading database files...')
          const guild = require(path.join(folder, guildFile))
          const user = require(path.join(folder, userFile))
          const blacklist = require(path.join(folder, blacklistFile))
          this.obj = { guild, user, blacklist }
          this.path = { folder, guildFile, userFile }

          logger.verbose('[JSON] 3 database files loaded')
        } catch (err) {
          logger.error('[JSON] Error when setting up json storage: ' + err.stack)
        }
        break
      }

      default:
        return logger.error('Invalid database type: ' + type)
    }

    setInterval(() => this.test(), 60000) // DB Test period

    logger.log('Database Handler initialized')
  }

  // ready value
  get ready () {
    return this._ready
  }

  set ready (v) {
    const loggerFn = logger.extend('ready setter')

    if (v !== this._ready) {
      if (v) {
        loggerFn.log('Test Passed')
        this._ready = true
      } else {
        loggerFn.warn('Test Failed; Database feature disabled.')
        this._ready = false
      }
    }
  }

  async test () {
    const loggerFn = logger.extend('test')

    loggerFn.verbose('Testing database status')
    switch (this.type) {
      case 'mysql':
      case 'pg':
        try {
          await this.knex.raw('select 1+1 as test')
          this.ready = true
          return true
        } catch (err) {
          loggerFn.error('Failed to connect to the database: ' + err.stack)
          this.ready = false
          return false
        }
      case 'json':
        // Autosave (defaults to 1 minute)
        loggerFn.verbose('[JSON] Auto-saving...')
        try {
          this.save()
          this.ready = true
          return true
        } catch (e) {
          this.ready = false
          return false
        }
    }
  }

  save () {
    const loggerFn = logger.extend('save')

    if (this.type !== 'json') return loggerFn.warn('No need to save; This only works with JSON database')

    this._save(this.obj.guild, this.path.guildFile)
    this._save(this.obj.user, this.path.userFile)

    loggerFn.log('[JSON] All data were saved')
  }

  _save (obj, filename) {
    fs.writeFileSync(path.join(this.path.folder, filename), JSON.stringify(obj, null, 2))
  }
}

module.exports = DatabaseHandler
