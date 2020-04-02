const Command = require('../../classes/Command')
const ClientError = require('../../classes/ClientError')
const path = require('path')

class LoadCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'load',
      aliases: ['ㅣㅐㅁㅇ'],
      description: 'commands.load.DESC:Loads a command.',
      owner: true,
      args: [
        {
          name: 'commands.load.args.command.NAME:command',
          type: 'common.string:string',
          description: 'commands.load.args.command.DESC:Command to load'
        }
      ]
    })
  }

  async run (client, msg, query, locale) {
    const t = client.locale.t
    let input
    try {
      if (query.args.length < 1) return await msg.reply(Command.makeUsage(this, query.cmd, locale))

      input = query.args[0]

      const fullpath = path.join(client.commands.cmdPath, input + '.js')
      const cmd = require(fullpath)

      const group = input.split('/')[0]
      const r = client.commands.register(cmd, group, fullpath)

      if (!r) return await msg.reply(t('commands.load.alreadyExists:That command (or aliases in it) already exists.', locale))
      return await msg.reply(t('commands.load.added:Loaded `%1$s` command.', locale, input))
    } catch (err) {
      this._client.logger.error('Command / Load', "Error when loading command '" + input + "': " + err.stack)
      new ClientError('An Error occured when loading the command: ' + err.message).report(msg, locale)
    }
  }
}

module.exports = LoadCommand
