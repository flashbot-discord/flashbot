class Command {
  constructor (client, infos) {
    this._client = client

    this._name = infos.name
    this._desc = infos.description || ''
    this._aliases = infos.aliases || []
    this._clientPerms = infos.clientPerms || []
    this._userPerms = infos.userPerms || []
    this._owner = infos.owner || false
    this._guildOnly = infos.guildOnly || false
    this._requireDB = infos.requireDB || false
    this._group = ''
    this._path = ''
  }

  async run (_client, _msg, _args, _locale) {
    throw new Error('run() function not provided')
  }

  reload () {
    this._client.logger.log('Command', "Reloading command '" + this._name + "'")
    const cmdPath = this._path
    delete require.cache[cmdPath]
    const newCmd = require(cmdPath)
    this._client.logger.debug('Command', "Deleted command cache for '" + this._name + "'")

    this._client.commands.reregister(this, newCmd)
    this._client.logger.log('Command', "Reloaded command '" + this._name + "'")
  }

  unload () {
    delete require.cache[this._path]
    this._client.commands.unregister(this)
  }

  static async pleaseRegisterUser(msg, locale) {

  }

  static async pleaseRegisterGuild(msg, locale) {
    return await msg.reply(this._client.locale.t('Command.pleaseRegister.guild:This feature requires server registration, but this server is not registered. Olease register this server to use this feature.', locale))
  }
}

module.exports = Command
