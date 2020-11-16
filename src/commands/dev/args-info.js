/**
 * @name args-info.js
 * @description 입력된 인수를 체크하는 명령어입니다.
 */
const Command = require('../_Command')

class ArgsInfoCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'args-info',
      aliases: ['argsinfo', 'ㅁㄱㅎㄴ-ㅑㅜ래', 'ㅁㄱㅎ냐ㅜ래'],
      description: 'commands.args-info.DESC:Testing with arguments',
      group: 'dev',
      args: [
        {
          name: 'commands.args-info.args.args.NAME:args',
          description: 'commands.args-info.args.args.DESC:The arguments to pass. Infinite arguments are accepted.',
          type: 'common.any:any'
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    if (query.args.length < 1) return msg.reply(Command.makeUsage(this, query.cmd, t))

    return msg.channel.send(t('commands.args-info.run', query.cmd, query.args.join(', ')))
  }
}

module.exports = ArgsInfoCommand
