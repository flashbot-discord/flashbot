class Command {
  constructor (client, infos) {
    this._logPos = 'Command'
    this._client = client

    this._name = infos.name
    this._desc = infos.description || ''
    this._aliases = infos.aliases || []
    this._clientPerms = infos.clientPerms || []
    this._userPerms = infos.userPerms || []
    this._owner = infos.owner || false
    this._guildOnly = infos.guildOnly || false
    this._guildAct = infos.guildAct || false
    this._requireDB = infos.requireDB || false
    this._args = infos.args || []
    this._group = infos.group || ''
    this._path = ''
  }

  async run (_client, _msg, _args, _locale) {
    throw new Error('run() method not provided')
  }

  reload () {
    const logPos = this._logPos + '.reload'

    this._client.logger.log(logPos, "Reloading command '" + this._name + "'")
    const cmdPath = this._path
    delete require.cache[cmdPath]
    const newCmd = require(cmdPath)
    this._client.logger.debug(logPos, "Deleted command cache for '" + this._name + "'")

    this._client.commands.reregister(this, newCmd)
    this._client.logger.log(logPos, "Reloaded command '" + this._name + "'")
  }

  unload () {
    delete require.cache[this._path]
    this._client.commands.unregister(this)
  }

  static async pleaseRegisterUser (cmd, msg, locale) {
    // TODO
  }

  static async pleaseActivateGuild (cmd, msg, locale) {
    return await msg.reply(cmd._client.locale.t('Command.pleaseRegister.guild', locale, cmd._client.config.prefix))
  }

  static makeUsage (cmd, called, locale) {
    const t = cmd._client.locale.t
    let str = ''
    cmd._args.forEach((arg) => {
      const name = t(arg.name, locale)
      const type = t(arg.type, locale)

      str = str + (arg.optional ? '[' : '(') + name + ': ' + type + (arg.optional ? ']' : ')') + ' '
    })
    str += '\n\n'
    cmd._args.forEach((arg) => {
      const name = t(arg.name, locale)
      const desc = t(arg.description, locale)
      str = str + (arg.optional ? '[' : '(') + name + (arg.optional ? ']' : ')') + ' - ' + desc + ' ' + '\n'
    })

    return t('Command.makeUsage.str:Usage: ```\n' +
     '%1$s%2$s %3$s\n' +
      '(Required) [Optional]\n' +
    '```', locale, cmd._client.config.prefix, called, str)
  }
}

module.exports = Command
