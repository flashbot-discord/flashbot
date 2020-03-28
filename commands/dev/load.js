const Command = require('../../classes/Command')
const path = require('path')

class LoadCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'load',
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
      try {
        cmd = require(fullpath)
      } catch (err) { return await msg.reply(client.locale.t('commands.load.cannotfind:Cannot find Command `%1$s`.', locale, input)) }

      const group = input.split('/')[0]
      client.commands.register(cmd, group, fullpath)

      return await msg.reply(client.locale.t('commands.load.added:Loaded `%1$s` command.', locale, input))
    } catch (err) {
      this._client.logger.error('Command / Load', "Error when loading command '" + input + "': " + err.stack)
      return await msg.reply(client.locale.t('commands.load.error:An Error occured when loading the command: ```\n%1$s\n```', locale, err.message))
    }
  }
}

module.exports = LoadCommand
