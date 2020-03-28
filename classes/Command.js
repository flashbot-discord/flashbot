class Command {
  constructor (client, infos) {
    this._client = client

    this._name = infos.name
    this._desc = infos.description || ''
    this._aliases = infos.aliases || []
    this._clientPerms = infos.clientPerms || []
    this._userPerms = infos.userPerms || []
    this._owner = infos.owner || false
    this._group = ''
    this._path = ''
  }

  run (_client, _msg, _args, _locale) {
    throw new Error('run() function not provided')
  }

  reload () {
    this._client.logger.log('Command', "Reloading command '" + this._name + "'")
    const cmdPath = this._path
    delete require.cache[cmdPath]
    const newCmd = require(cmdPath)
    this._client.logger.debug('Command', "Deleted command cache for '" + this._name + "'")

    this._client.commands.reregister(this, newCmd)
    this._client.logger.log('Command', "Reloaded command '" + newCmd._name + "'")
  }
}

module.exports = Command
