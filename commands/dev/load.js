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
    let input
    try {
      if (query.args.length < 1) return await msg.reply(Command.makeUsage(this, query.cmd, locale))

      input = query.args[0]

      let cmd, fullpath = path.join(client.commands.cmdPath, input + '.js')
      cmd = require(fullpath)

      const group = input.split('/')[0]
      client.commands.register(cmd, group, fullpath)

      return await msg.reply(client.locale.t('commands.load.added:Loaded `%1$s` command.', locale, input))
    } catch (err) {
      this._client.logger.error('Command / Load', "Error when loading command '" + input + "': " + err.stack)
      throw new ClientError(client.locale.t('commands.load.error:An Error occured when loading the command: %1$s', locale, err.message))
    }
  }
}

module.exports = LoadCommand
