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
      group: 'dev',
      args: [
        {
          key: 'args',
          type: 'any',
          infinity: true
        }
      ]
    })
  }

  async run (client, msg, query, { t }) {
    // if (query.args.length < 1) return msg.reply(Command.makeUsage(this, query.cmd, t))

    return msg.channel.send(t('commands.args-info.run', query.cmd, query.args.args.join(', ')))
  }
}

module.exports = ArgsInfoCommand
