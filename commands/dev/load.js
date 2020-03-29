const Command = require('../../classes/Command')
const ClientError = require('../../classes/ClientError')
const path = require('path')

class LoadCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'load',
      aliases: ['ㅣㅐㅁㅇ'],
      description: 'Loads a command.',
      owner: true
    })
  }

  async run (client, msg, query, locale) {
    let input
    try {
      if (query.args.length < 1) {
        return await msg.reply(client.locale.t('commands.load.usage:Usage: ```\n%1$sload <command>\n```', locale, client.config.prefix))
      }

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
