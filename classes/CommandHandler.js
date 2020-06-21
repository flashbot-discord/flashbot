const fs = require('fs')
const path = require('path')
const uuid = require('uuid-random')

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
  }

  registerGroups (groups) {
    groups.forEach((group) => {
      this.groups.set(group, [])
      this._client.logger.log(this.logPos + '.registerGroups', "Registered command group '" + group + "'")
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
        this._client.logger.debug(logPos, "Loading commands in folder '" + folder + "'")

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
              this._client.logger.error(logPos, "Error loading command '" + cmdFile + "'. " + err.stack)
            }
          })
        } catch (err) {
          this._client.logger.error(logPos, "Error fetching file list in folder '" + folder + "'. " + err.stack)
        }
      })
    } catch (err) {
      this._client.logger.error(logPos, 'Error loading folders that the commands located. ' + err.stack)
    }

    this._client.logger.log(logPos, this.commands.size + ' commands registered.')
    this._client.logger.log(logPos, this.aliases.size + ' command aliases registered.')
  }

  register (CommandFile, fullpath) {
    const logPos = this.logPos + '.register'
    const c = new CommandFile(this._client)

    // Conflict check
    if (this.commands.has(c._name)) {
      return this._client.logger.error(logPos, "Command '" + c._name + "' already exists.")
    }

    for (const alias of this.aliases) {
      if (c._aliases.includes(alias)) {
        return this._client.logger.error(logPos, "Command Alias '" + alias + "' already exists.")
      }
    }

    c._path = fullpath

    this.commands.set(c._name, c)
    this._client.logger.debug(logPos, "Registered command object '" + c._name + "'")

    this.aliases.set(c._name, c._name)
    if (c._aliases.length > 0) c._aliases.forEach((alias) => { this.aliases.set(alias, c._name) })
    this._client.logger.debug(logPos, "Registered all command aliases for '" + c._name + "': " + c._aliases.join(', '))
    if (this.groups.has(c._group)) this.groups.set(this.groups.get(c._group).push(c._name))
    else this._client.logger.error(logPos, "Cannot register command '" + c._name + "' to group '" + c._group + "'")

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
    const group = this.groups.get(cmd._group)
    group.splice(group.indexOf(cmd._name), 1)
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

  async run (cmd, client, msg, query) {
    const locale = await client.locale.getGuildLocale(msg.guild)

    if (!msg.guild.me.permissions.has(cmd._clientPerms)) return await msg.reply(client.locale.t('CommandHandler.noClientPermission:I need to have `%1$s` permissions to run this command.', locale, cmd._clientPerms.join('`, `')))

    // Status Check
    if (cmd._requireDB && !this._client.db.ready) {
      return await msg.channel.send(client.locale.t('error.DBNotReady:This feature needs the database storage to work.\n' +
    'Currently, the bot is not connected to the storage.\n' +
    'Please report this to the Support server to be fixed.', locale))
    }

    if (cmd._guildOnly && !msg.guild) return await msg.reply(client.locale.t('CommandHandler.run.guildOnly:This command can only run on server text channel.', locale))

    if (cmd._guildAct && !(await client.db.isActivatedGuild(msg.guild.id))) return msg.channel.send(client.locale.t('Command.pleaseRegister.guild', locale, client.config.prefix))

    // Perms Check
    let owner = false
    if (client.config.owner.includes(msg.author.id)) owner = true
    if (cmd._owner && !owner) return await msg.reply(client.locale.t('CommandHandler.run.ownerOnly:Only the owners of the bot can run this command.', locale))

    if (!owner && !msg.member.permissions.has(cmd._userPerms)) return await msg.reply(client.locale.t('CommandHandler.noUserPermission:You need to have `%1$s` permissions to use this command.', locale, cmd._userPerms.join('`, `')))

    // Run
    try {
      await cmd.run(client, msg, query, locale)
    } catch (err) {
      const uid = uuid()

      client.logger.error(this.logPos + '.run => ' + cmd._name, 'Error (' + uid + '): ' + err.stack)
      return await msg.reply(client.locale.t('CommandHandler.unexpectedError:' +
      'An unexpected error occured. Please report this error message and the Error ID to the Support server.\n' +
        'Error message: ```\n%1$s\n```\n' +
        'Error ID: `%2$s`', locale, err.message, uid))
    }
  }
}

module.exports = CommandHandler
