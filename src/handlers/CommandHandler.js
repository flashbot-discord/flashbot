const fs = require('fs')
const path = require('path')
const { Collection } = require('discord.js')

const StatHandler = require('./StatHandler')
const argumentRunner = require('../structures/command/arguments/ArgumentRunner')
const database = require('../database')
const ClientError = require('../structures/ClientError')
const ArgumentError = require('../structures/command/arguments/ArgumentError')
const makeCommandUsage = require('../structures/command/usage')

const logger = require('../shared/logger')('CommandHandler')

/**
 * Stores commands and execute on command message.
 */
class CommandHandler {
  constructor (client) {
    /**
     * Bot Client
     * @type {BotClient} client
     */
    this._client = client
    /**
     * The path where base commands are located
     * @type {string} path
     */
    this.baseCmdPath = ''

    /**
     * Commands registry
     * @type {Map<string, Command>} Registered commands, mapped with their name
     */
    this.commands = new Collection()
    /**
     * Command Aliases registry
     * @type {Map<string, string>} Map of Aliases => Command name
     */
    this.aliases = new Collection()
    /**
     * Command Groups registry
     * @type {Map<string, string>} Map of group name => group description
     */
    this.groups = new Collection()

    this.stats = new StatHandler(client)
  }

  /**
   * register command groups.
   * @type {Array<string>} groups array of group names
   */
  registerGroups (groups) {
    groups.forEach((group) => {
      this.groups.set(group, [])
      logger.verbose(`registered command group '${group}'`)
    })
  }

  /**
   * register base command directory path and load commands.
   * @type {string} cmdPath path to commands directory
   */
  registerBaseCommands (cmdPath) {
    if (this.baseCmdPath.length > 0) logger.error('Base Command path already registered')
    this.baseCmdPath = cmdPath
    logger.verbose('Base Command path: ' + cmdPath)

    this.registerCommandsIn(cmdPath)
  }

  /**
   * load commands from base path.
   * @type {string} cmdPath path to commands directory
   */
  registerCommandsIn (cmdPath) {
    const loggerFn = logger.extend('registerCommandsIn')

    // read base directory
    try {
      const folders = fs.readdirSync(cmdPath)

      folders.forEach((folder) => {
        if (!fs.lstatSync(path.join(cmdPath, folder)).isDirectory()) return
        loggerFn.debug(`Loading commands in folder '${folder}'`)

        // read files within each directory
        try {
          const cmdFiles = fs.readdirSync(path.join(cmdPath, folder))

          cmdFiles.forEach((cmdFile) => {
            try {
              // check file type
              loggerFn.debug('Checking file for command: ' + cmdFile)
              if (!cmdFile.endsWith('.js')) return loggerFn.debug('Not a Javascript file. Skipping.')

              const fullpath = path.join(cmdPath, folder, cmdFile)
              const cmd = require(fullpath)
              this.register(cmd, fullpath)
            } catch (err) {
              logger.error(`Error loading command '${cmdFile}'.\n` + err.stack)
            }
          })
        } catch (err) {
          loggerFn.error(`Error fetching file list in folder '${folder}'.\n` + err.stack)
        }
      })
    } catch (err) {
      loggerFn.error('Error loading folders that the commands located.\n' + err.stack)
    }

    loggerFn.log(this.commands.size + ' commands registered.')
    loggerFn.log(this.aliases.size + ' command aliases registered.')
  }

  /**
   * creates and registers a command.
   * @type {*} CommandFile command class from file
   * @type {string} fullpath absolute path to command file
   * @returns {Command} registered command object
   */
  register (CommandFile, fullpath) {
    const loggerFn = logger.extend('register')
    const c = new CommandFile(this._client)

    // Conflict check
    if (this.commands.has(c._name)) {
      return loggerFn.error(`Command '${c._name}' already exists.`)
    }

    if (c._aliases.some(alias => this.aliases.has(alias))) {
      const alias = c._aliases.find(a => this.aliases.has(a))
      return logger.error(`Command Alias '${alias}' already exists.`)
    }

    // register command to registry
    c._path = fullpath

    this.commands.set(c._name, c)
    logger.debug(`Registered command object '${c._name}'`)

    this.aliases.set(c._name, c._name)
    if (c._aliases.length > 0) c._aliases.forEach((alias) => { this.aliases.set(alias, c._name) })
    logger.debug(`Registered all command aliases for '${c._name}': ` + c._aliases.join(', '))
    if (this.groups.has(c._group)) this.groups.get(c._group).push(c._name)
    else {
      logger.error(`Cannot register command '${c._name}' to group '${c._group}' which is not registered.`)
      return c.unload()
    }

    logger.log('Command Loaded: ' + c._name)
    return c
  }

  /**
   * reregisters a command
   * @type {Command} oldCmd old command object
   * @type {*} newCmd new command class to reregister
   */
  reregister (oldCmd, newCmd) {
    this.unregister(oldCmd)
    this.register(newCmd, oldCmd._path)
  }

  /**
   * unregisters a command.
   * @type {Command} cmd command to unregister
   */
  unregister (cmd) {
    // remove command name in group
    if (cmd._group.length > 0) {
      const group = this.groups.get(cmd._group)
      if (group) group.splice(group.indexOf(cmd._name), 1)
    }

    // remove all aliases
    logger.verbose(`Unregistering all command aliases for '${cmd._name}'`)
    cmd._aliases.forEach((alias) => { if (this.aliases.has(alias)) this.aliases.delete(alias) })
    this.commands.delete(cmd._name)

    // remove command name itself
    logger.verbose(`Unregistering command '${cmd._name}'`)
    this.commands.delete(cmd._name)

    logger.log('Command Unloaded: ' + cmd._name)
  }

  get (name) {
    const cmd = this.aliases.get(name)
    return this.commands.get(cmd)
  }

  has (name, alias = false) {
    return alias ? this.aliases.has(name) : this.commands.has(name)
  }

  async run (cmd, client, msg, query) {
    logger.verbose('requested command execution of %o', cmd._name)

    const owner = client.config.owner.includes(msg.author.id)
    logger.debug('isOwner: %o', owner)

    // Get locale and create translate function
    let locale = await client.locale.getLocale(false, msg.author)
    logger.debug('user locale: %o', locale)

    if (msg.guild && locale == null) {
      const guildLocale = await client.locale.getLocale(true, msg.guild)
      logger.debug('guild locale: %o', guildLocale)

      if (guildLocale != null) locale = guildLocale
      else locale = client.locale.defaultLocale
    }
    const translateFunc = client.locale.getTranslateFunc(locale)
    const { t } = translateFunc

    // NOTE: Begin permission checks
    logger.verbose('checking permissions for running command')

    try {
      // Database Check
      if ((cmd._requireDB || cmd._userReg || cmd._guildAct) && !client.db.ready) {
        return await msg.channel.send(t('error.DBNotReady'))
      }

      // NOTE: Check if command is globally disabled
      if (!owner && !cmd._enabled) return msg.reply(t('CommandHandler.cmdDisabled'))

      // Is User Registered?
      if (
        cmd._userReg &&
        !(await database.users.isRegistered(client.db, msg.author.id))
      ) {
        logger.debug('user is not registered')
        if (owner) msg.channel.send(t('CommandHandler.unregisteredOwner'))
        else return msg.reply(t('Command.pleaseRegister.user', client.config.prefix))
      }

      // Is Guild Only?
      if (cmd._guildOnly && !msg.guild) return await msg.reply(t('CommandHandler.run.guildOnly'))

      // Is Guild Activated?
      if (
        cmd._guildAct &&
        !(await database.guilds.isActivated(client.db, msg.guild.id))
      ) {
        logger.debug('guild is not activated')
        return msg.channel.send(t('Command.pleaseRegister.guild', client.config.prefix))
      }

      // Perms Check
      if (cmd._owner && !owner) return await msg.reply(t('CommandHandler.run.ownerOnly'))

      if (msg.guild) {
        if (!msg.channel.permissionsFor(client.user).has(cmd._clientPerms)) return msg.reply(t('CommandHandler.noClientPermission', cmd._clientPerms.join('`, `')))

        if (!owner && !msg.channel.permissionsFor(msg.author).has(cmd._userPerms)) return msg.reply(t('CommandHandler.noUserPermission', cmd._userPerms.join('`, `')))
      }

      logger.verbose('permission chack passed')
      logger.verbose('parsing arguments')

      // Parse arguments and validate
      try {
        query.args = await argumentRunner.runArgs(msg, cmd, query.rawArgs) // await cmd._args.parseArguments(msg, query.rawArgs)
      } catch (err) {
        logger.debug('error on arg parsing: %O', err)
        if (err instanceof ArgumentError) {
          /*
          const argsText = Array.isArray(err.argData.type)
            ? err.argData.type.length > 1
              ? t('Command.arguments.typeMismatch.multipleArgs', err.argData.type.slice(0, -1).join('`, `'), err.argData.type.slice(-1)[0])
              : err.argData.type[0]
            : err.argData.type
          */
          const ctx = {
            previous: err.alreadyParsedArgs,
            now: err.argData
          }
          const usageText = makeCommandUsage(msg, cmd, query, t, ctx, false)
          const print =
`${t('CommandHandler.usage')}\`\`\`
${usageText}
\`\`\``
          return msg.reply(print)
        } else throw err
      }

      logger.verbose('argument parsed')

      // Log command usage
      this.stats.stat(query.cmd, msg.guild ? msg.guild.id : 0)

      // Run
      logger.verbose('running command')
      await cmd.run(client, msg, query, translateFunc)
    } catch (err) {
      const e = new ClientError(err)
      e.report(msg, t, `${this.logPos}.run => ${cmd._name}`)
    }
  }
}

module.exports = CommandHandler
