const fs = require('fs')
const path = require('path')
const uuid = require('uuid-random')

class CommandHandler {
  constructor (client, cmdPath) {
    /**
     * Bot Client
     * @type {BotClient} client
     */
    this._client = client
    /**
     * The path where commands are located
     * @type {string} path
     */
    this.cmdPath = cmdPath

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
    try {
      const groups = fs.readdirSync(cmdPath)

      groups.forEach((group) => {
        if (!fs.lstatSync(path.join(cmdPath, group)).isDirectory()) return
        client.logger.debug('CommandHandler', 'Loading commands in group ' + group)

        try {
          const cmdFiles = fs.readdirSync(path.join(cmdPath, group))

          cmdFiles.forEach((cmdFile) => {
            try {
              client.logger.debug('CommandHandler', 'Checking file for command: ' + cmdFile)
              if (!cmdFile.endsWith('.js')) return client.logger.debug('CommandHandler', 'Not a Javascript file. Skipping.')

              const fullpath = path.join(cmdPath, group, cmdFile)
              const cmd = require(fullpath)
              const c = this.register(cmd, group, fullpath)
              client.logger.log('CommandHandler', 'Command Loaded: ' + c._name)
            } catch (err) {
              client.logger.error('CommandHandler', "Error loading command '" + cmdFile + "'. " + err.stack)
            }
          })
        } catch (err) {
          client.logger.error('CommandHandler', "Error fetching file list in group '" + group + "'. " + err.stack)
        }
      })
    } catch (err) {
      client.logger.error('CommandHandler', 'Error loading command groups. ' + err.stack)
    }

    client.logger.log('CommandHandler', this.commands.size + ' commands registered.')
    client.logger.log('CommandHandler', this.aliases.size + ' command aliases registered.')
  }

  register (CommandFile, group, fullpath) {
    const c = new CommandFile(this._client)

    // Conflict check
    if (this.commands.has(c._name)) {
      return this._client.logger.error('CommandHandler.register', "Command '" + c._name + "' already exists.")
    }

    for (const alias of this.aliases) {
      if (c._aliases.includes(alias)) {
        return this._client.logger.error('CommandHandler.register', "Command Alias '" + alias + "' already exists.")
      }
    }

    c._group = group
    c._path = fullpath

    this.commands.set(c._name, c)
    this._client.logger.debug('CommandHandler', "Registered command object '" + c._name + "'")

    this.aliases.set(c._name, c._name)
    if (c._aliases.length > 0) c._aliases.forEach((alias) => { this.aliases.set(alias, c._name) })
    this._client.logger.debug('CommandHandler', "Registered all command aliases for '" + c._name + "'")

    return c
  }

  reregister(oldCmd, newCmd) {
    this.unregister(oldCmd)
    this.register(newCmd)
  }

  unregister (cmd) {
    // remove all aliases
    this._client.logger.debug('CommandHandler', "Unregistering all command aliases for '" + cmd._name +"'")
    cmd._aliases.forEach((alias) => { if (this.aliases.has(alias)) this.aliases.delete(alias) })
    this.commands.delete(cmd._name)

    // remove command name itself
    this._client.logger.debug('CommandHandler', "Unregistering command '" + cmd._name + "'")
    this.commands.delete(cmd._name)
  }

  get(name) {
    const cmd = this.aliases.get(name)
    return this.commands.get(cmd)
  }

  async run(cmd, client, msg, query) {
    const locale = await client.locale.getGuildLocale(msg.guild.id)

    // Perms Check
    if(cmd.owner && !client.owner.includes(msg.author.id)) return await msg.reply(client.locale.t('ownerOnly:Only the owners of the bot can run this command.', locale))
    
    // Run
    try {
      cmd.run(client, msg, query, locale)
    } catch (err) {
      let uid = uuid()
      client.logger.error('CommandHandler.run => ' + cmd._name, 'Unexpected error (' + uid +'): ' + err.stack)
      return await msg.reply(client.locale.t('unexpectedError:'
      + 'An Unexpected error occured. Please report this error message and the Error ID to the Support server.\n'
        + 'Error message: %1$s\n'
        + 'Error ID: %2$s', locale, err.message, uid))
    }
  }
}

module.exports = CommandHandler
