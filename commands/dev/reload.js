const Command = require('../../classes/Command')
const ClientError = require('../../classes/ClientError')

class ReloadCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'reload',
      aliases: ['ㄱ디ㅐㅁㅇ'],
      description: 'commands.reload.DESC:reloads a command',
      group: 'dev',
      owner: true,
      args: [
        {
          name: 'commands.reload.args.command.NAME:command',
          type: 'common.string:string',
          description: 'commands.reload.args.command.DESC:Command to reload'
        }
      ]
    })
  }

  async run (client, msg, query, locale) {
    let input
    try {
      if (query.args.length < 1) {
        return await msg.reply(Command.makeUsage(this, query.cmd, locale))
      }

      input = query.args[0]
      const cmd = client.commands.get(input)
      if (!cmd) return msg.reply(client.locale.t('commands.reload.cannotfind:Cannot find command `%1$s`.', locale, input))

      cmd.reload()
      return msg.reply(client.locale.t('commands.reload.reloaded:Reloaded `%1$s` command.', locale, cmd._name))
    } catch (err) {
      this._client.logger.error('Command / Reload', 'Error when reloading command ' + input + ': ' + err.stack)
      new ClientError(client.locale.t('commands.reload.error:An error occured while reloading the command: %1$s', locale, err.message)).report(msg, locale)
    }
  }
}

module.exports = ReloadCommand
