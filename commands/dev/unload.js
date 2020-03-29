const Command = require('../../classes/Command')
const ClientError = require('../../classes/ClientError')

class UnloadCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'unload',
      aliases: ['ㅕㅟㅐㅁㅇ'],
      description: 'Unloads a command.',
      owner: true
    })
  }

  async run (client, msg, query, locale) {
    let input
    try {
      if (query.args.length < 1) {
        return await msg.reply(client.locale.t('commands.unload.usage:Usage: ```\n%1$sunload <command>\n```', locale, client.config.prefix))
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
