const fs = require('fs')
const path = require('path')
const minimist = require('minimist')

const StatHandler = require('./StatHandler')
const database = require('../database')
const ClientError = require('../structures/ClientError')

class CommandHandler {
  constructor (client) {
    this.logPos = 'CommandHandler'

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
    this.commands = new Map()
    /**
     * Command Aliases registry
     * @type {Map<string, string>} Map of Aliases => Command name
     */
    this.aliases = new Map()
    /**
     * Command Groups registry
     * @type {Map<string, string>} Map of group name => group description
     */
    this.groups = new Map()

    this.stats = new StatHandler(client)
  }

  registerGroups (groups) {
    groups.forEach((group) => {
      this.groups.set(group, [])
      this._client.logger.log(this.logPos + '.registerGroups', `Registered command group '${group}'`)
    })
  }

  registerBaseCommands (cmdPath) {
    const logPos = this.logPos + '.registerBaseCommands'
    if (this.baseCmdPath.length > 0) this._client.logger.error(logPos, 'Base Command path already registered')
    this.baseCmdPath = cmdPath
    this._client.logger.log(logPos, 'Base Command path registered: ' + cmdPath)

    this.registerCommandsIn(cmdPath)
  }

  registerCommandsIn (cmdPath) {
    const logPos = this.logPos + '.registerCommandsIn'

    try {
      const folders = fs.readdirSync(cmdPath)

      folders.forEach((folder) => {
        if (!fs.lstatSync(path.join(cmdPath, folder)).isDirectory()) return
        this._client.logger.debug(logPos, `Loading commands in folder '${folder}'`)

        try {
          const cmdFiles = fs.readdirSync(path.join(cmdPath, folder))

          cmdFiles.forEach((cmdFile) => {
            try {
              this._client.logger.debug(logPos, 'Checking file for command: ' + cmdFile)
              if (!cmdFile.endsWith('.js')) return this._client.logger.debug(logPos, 'Not a Javascript file. Skipping.')

              const fullpath = path.join(cmdPath, folder, cmdFile)
              const cmd = require(fullpath)
              this.register(cmd, fullpath)
            } catch (err) {
              this._client.logger.error(logPos, `Error loading command '${cmdFile}'.\n` + err.stack)
            }
          })
        } catch (err) {
          this._client.logger.error(logPos, `Error fetching file list in folder '${folder}'.\n` + err.stack)
        }
      })
    } catch (err) {
      this._client.logger.error(logPos, 'Error loading folders that the commands located.\n' + err.stack)
    }

    this._client.logger.log(logPos, this.commands.size + ' commands registered.')
    this._client.logger.log(logPos, this.aliases.size + ' command aliases registered.')
  }

  register (CommandFile, fullpath) {
    const logPos = this.logPos + '.register'
    const c = new CommandFile(this._client)

    // Conflict check
    if (this.commands.has(c._name)) {
      return this._client.logger.error(logPos, `Command '${c._name}' already exists.`)
    }

    for (const alias of this.aliases) {
      if (c._aliases.includes(alias)) {
        return this._client.logger.error(logPos, `Command Alias '${alias}' already exists.`)
      }
    }

    c._path = fullpath

    this.commands.set(c._name, c)
    this._client.logger.debug(logPos, `Registered command object '${c._name}'`)

    this.aliases.set(c._name, c._name)
    if (c._aliases.length > 0) c._aliases.forEach((alias) => { this.aliases.set(alias, c._name) })
    this._client.logger.debug(logPos, `Registered all command aliases for '${c._name}': ` + c._aliases.join(', '))
    if (this.groups.has(c._group)) this.groups.get(c._group).push(c._name)
    else {
      this._client.logger.error(logPos, `Cannot register command '${c._name}' to group '${c._group}' which is not registered.`)
      return c.unload()
    }

    this._client.logger.log(logPos, 'Command Loaded: ' + c._name)
    return c
  }

  reregister (oldCmd, newCmd) {
    this.unregister(oldCmd)
    this.register(newCmd, oldCmd._path)
  }

  unregister (cmd) {
    const logPos = this.logPos + '.unregister'

    // remove command name in group
    if (cmd._group.length > 0) {
      const group = this.groups.get(cmd._group)
      if (group) group.splice(group.indexOf(cmd._name), 1)
    }

    // remove all aliases
    this._client.logger.debug(logPos, "Unregistering all command aliases for '" + cmd._name + "'")
    cmd._aliases.forEach((alias) => { if (this.aliases.has(alias)) this.aliases.delete(alias) })
    this.commands.delete(cmd._name)

    // remove command name itself
    this._client.logger.debug(logPos, "Unregistering command '" + cmd._name + "'")
    this.commands.delete(cmd._name)

    this._client.logger.log(logPos, 'Command Unloaded: ' + cmd._name)
  }

  get (name) {
    const cmd = this.aliases.get(name)
    return this.commands.get(cmd)
  }

  has (name, alias = false) {
    return alias ? this.aliases.has(name) : this.commands.has(name)
  }

  async run (cmd, client, msg, query) {
    const owner = client.config.owner.includes(msg.author.id)

    // Get locale and create translate function
    let locale = await client.locale.getLocale(false, msg.author)
    if (msg.guild && locale == null) {
      const guildLocale = await client.locale.getLocale(true, msg.guild)
      if (guildLocale != null) locale = guildLocale
      else locale = client.locale.defaultLocale
    }
    const translateFunc = client.locale.getTranslateFunc(locale)
    const { t } = translateFunc

    // NOTE: Begin permission checks
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
        if (owner) msg.channel.send(t('CommandHandler.unregisteredOwner'))
        else return msg.reply(t('Command.pleaseRegister.user', client.config.prefix))
      }

      // Is Guild Only?
      if (cmd._guildOnly && !msg.guild) return await msg.reply(t('CommandHandler.run.guildOnly'))

      // Is Guild Activated?
      if (
        cmd._guildAct &&
        !(await database.guilds.isActivated(client.db, msg.guild.id))
      ) return msg.channel.send(t('Command.pleaseRegister.guild', client.config.prefix))

      // Perms Check
      if (cmd._owner && !owner) return await msg.reply(t('CommandHandler.run.ownerOnly'))

      if (msg.guild) {
        if (!msg.channel.permissionsFor(client.user).has(cmd._clientPerms)) return msg.reply(t('CommandHandler.noClientPermission', cmd._clientPerms.join('`, `')))

        if (!owner && !msg.channel.permissionsFor(msg.author).has(cmd._userPerms)) return msg.reply(t('CommandHandler.noUserPermission', cmd._userPerms.join('`, `')))
      }

      // Parse arguments and validate
      try {
        query.args = cmd._args.parseArguments(query.rawArgs)
      } catch (err) {
        if (!(err instanceof Error) && typeof err === 'object') {
          const argsText = Array.isArray(err.argData.type)
            ? t('Command.arguments.typeMismatch.multipleArgs', err.argData.type.slice(0, -1).join('`, `'), err.argData.type.slice(-1)[0])
            : err.argData.type

          if (err.named) {
            return msg.reply(t('Command.arguments.typeMismatch.namedArgs', err.argData.name, argsText))
          } else {
            return msg.reply(t('Command.arguments.typeMismatch.unnamedArgs', err.index + 1, err.argData.key, argsText))
          }
        }
      }
      
      // Log command usage
      this.stats.stat(query.cmd, msg.guild ? msg.guild.id : 0)

      // Run
      await cmd.run(client, msg, query, translateFunc)
    } catch (err) {
      const e = new ClientError(err)
      e.report(msg, t, `${this.logPos}.run => ${cmd._name}`)
    }
  }
}

module.exports = CommandHandler
