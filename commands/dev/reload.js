const Command = require('../../classes/Command')

class ReloadCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'reload',
      description: 'reloads a command',
      owner: true
    })
  }

  async run (client, msg, query, locale) {
    let input
    try {
      if (query.args.length < 1) {
        return msg.reply(client.locale.t('commands.reload.usage:Usage:```\n%1$sreload <command>\n```', locale, client.config.prefix))
      }

      input = query.args[0]
      const cmd = client.commands.get(input)
      if (!cmd) return msg.reply(client.locale.t('commands.reload.cannotfind:Cannot find command `%1$s`.', locale, input))

      cmd.reload()
      return msg.reply(client.locale.t('commands.reload.reloaded:Reloaded `%1$s` command.', locale, cmd._name))
    } catch (err) {
      this._client.logger.error('Command / Reload', 'Error when reloading command: ' + input)
      return await msg.reply(client.locale.t('commands.reload.error:An error occured while reloading the command: ```\n%1$s\n```', locale, err.message))
    }
  }
}

module.exports = ReloadCommand
