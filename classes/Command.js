class Command {
  constructor (client, infos) {
    this._client = client

    this._name = infos.name
    this._desc = infos.description || ''
    this._aliases = infos.aliases || []
  }
}

module.exports = Command
