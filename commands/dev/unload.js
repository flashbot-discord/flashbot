const Command = require('../../classes/Command')
const ClientError = require('../../classes/ClientError')

class UnloadCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'unload',
      aliases: ['ㅕㅟㅐㅁㅇ'],
      description: 'commands.unload.DESC:Unloads a command.',
      owner: true,
      args: [
        {
          name: 'commands.unload.args.command.NAME:command',
          type: 'common.string:string',
          description: 'commands.unload.args.command.DESC:Command to unload'
        }
      ]
    })
  }

  async run (client, msg, query, locale) {
    let input
    try {
      if (query.args.length < 1) {
        return await msg.reply(Command.makeUsage(this, query.msg, locale))
      }

      input = query.args[0]
      const cmd = client.commands.get(input)
      if (!cmd) return await msg.reply(client.locale.t('commands.unload.cannotfind:Cannot find command `%1$s`.', locale, input))

      cmd.unload()
      return await msg.reply(client.locale.t('commands.unload.unloaded:Unloaded `%1$s` command.', locale, cmd._name))
    } catch (err) {
      this._client.logger.error('Command / Unload', 'Error when unloading command ' + input + ': ' + err.stack)
      throw new ClientError(client.locale.t('commands.unload.error:An Error occured while unloading the command: ```\n%1$s\n```', locale, err.message))
    }
  }
}

module.exports = UnloadCommand
