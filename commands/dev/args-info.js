/**
 * @name args-info.js
 * @description 입력된 인수를 체크하는 명령어입니다.
 */
const Command = require('../../classes/Command')

class ArgsInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'args-info',
      aliases: ['argsinfo', 'ㅁㄱㅎㄴ-ㅑㅜ래', 'ㅁㄱㅎ냐ㅜ래'],
      description: 'commands.args-info.DESC:Testing with arguments',
      args: [
        {
          name: 'commands.args-info.args.args.NAME:args',
          description: 'commands.args-info.args.args.DESC:The arguments to pass. Infinite arguments are accepted.',
          type: 'common.any:any'
        }
      ]
    })
  }

  async run (client, msg, query, locale) {
    if (query.args.length < 1) return await msg.reply(Command.makeUsage(this, query.cmd, locale))

    return await msg.channel.send(client.locale.t('commands.args-info.run:'
      + 'Command name: %1$s\nArguments: %2$s', locale, query.cmd, query.args.join(', ')))
  }
}

module.exports = ArgsInfoCommand
